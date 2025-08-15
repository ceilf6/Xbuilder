package controller

import (
	"context"
	"fmt"
	"regexp"

	"github.com/goplus/builder/spx-backend/internal/authn"
	"github.com/goplus/builder/spx-backend/internal/model"
)

// RecordDTO is the DTO for records.
type RecordDTO struct {
	ModelDTO

	Owner        string     `json:"owner"`
	ProjectID    int64      `json:"projectId"`
	Project      *ProjectDTO `json:"project,omitempty"`
	Name         string     `json:"name"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	VideoURL     string     `json:"videoUrl"`
	ThumbnailURL string     `json:"thumbnailUrl"`
	Duration     int64      `json:"duration"`
	FileSize     int64      `json:"fileSize"`
	Visibility   model.Visibility `json:"visibility"`
	ViewCount    int64      `json:"viewCount"`
	LikeCount    int64      `json:"likeCount"`
}

// toRecordDTO converts the model record to its DTO.
func toRecordDTO(mRecord model.Record) RecordDTO {
	dto := RecordDTO{
		ModelDTO:     toModelDTO(mRecord.Model),
		Owner:        mRecord.User.Username,
		ProjectID:    mRecord.ProjectID,
		Name:         mRecord.Name,
		Title:        mRecord.Title,
		Description:  mRecord.Description,
		VideoURL:     mRecord.VideoURL,
		ThumbnailURL: mRecord.ThumbnailURL,
		Duration:     mRecord.Duration,
		FileSize:     mRecord.FileSize,
		Visibility:   mRecord.Visibility,
		ViewCount:    mRecord.ViewCount,
		LikeCount:    mRecord.LikeCount,
	}

	if mRecord.Project.ID != 0 {
		projectDTO := toProjectDTO(mRecord.Project)
		dto.Project = &projectDTO
	}

	return dto
}

// recordNameRE is the regular expression for record name.
var recordNameRE = regexp.MustCompile(`^[\w-]{1,100}$`)

// recordTitleRE is the regular expression for record title.
var recordTitleRE = regexp.MustCompile(`^.{1,200}$`)

// ensureRecord ensures the record exists and the user has access to it.
func (ctrl *Controller) ensureRecord(ctx context.Context, owner, name string, ownedOnly bool) (*model.Record, error) {
	var mRecord model.Record
	if err := ctrl.db.WithContext(ctx).
		Preload("User").
		Preload("Project.Owner").
		Joins("JOIN user ON user.id = record.user_id").
		Where("user.username = ?", owner).
		Where("record.name = ?", name).
		First(&mRecord).
		Error; err != nil {
		return nil, fmt.Errorf("failed to get record: %w", err)
	}

	if ownedOnly || mRecord.Visibility == model.VisibilityPrivate {
		if _, err := authn.EnsureUser(ctx, mRecord.UserID); err != nil {
			return nil, err
		}
	}

	return &mRecord, nil
}

// CreateRecordParams holds parameters for creating a record.
type CreateRecordParams struct {
	ProjectID    int64  `json:"projectId"`
	Name         string `json:"name"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	VideoURL     string `json:"videoUrl"`
	ThumbnailURL string `json:"thumbnailUrl"`
	Duration     int64  `json:"duration"`
	FileSize     int64  `json:"fileSize"`
}

// Validate validates the CreateRecordParams.
func (p *CreateRecordParams) Validate() (ok bool, msg string) {
	if p.ProjectID == 0 {
		return false, "missing projectId"
	}
	if p.Name == "" {
		return false, "missing name"
	} else if !recordNameRE.Match([]byte(p.Name)) {
		return false, "invalid name"
	}
	if p.Title == "" {
		return false, "missing title"
	} else if !recordTitleRE.Match([]byte(p.Title)) {
		return false, "invalid title"
	}
	if p.VideoURL == "" {
		return false, "missing videoUrl"
	}
	if p.Duration <= 0 {
		return false, "invalid duration"
	}
	return true, ""
}

// CreateRecord creates a new record.
func (ctrl *Controller) CreateRecord(ctx context.Context, params *CreateRecordParams) (*RecordDTO, error) {
	mUser, ok := authn.UserFromContext(ctx)
	if !ok {
		return nil, authn.ErrUnauthorized
	}

	// 验证参数
	if ok, msg := params.Validate(); !ok {
		return nil, fmt.Errorf("validation failed: %s", msg)
	}

	// 检查项目是否存在且用户有权限访问
	var mProject model.Project
	if err := ctrl.db.WithContext(ctx).
		Preload("Owner").
		Where("id = ?", params.ProjectID).
		First(&mProject).Error; err != nil {
		return nil, fmt.Errorf("project not found: %w", err)
	}

	// 检查项目可见性（只能录制公开项目，除非是项目所有者）
	if mProject.Visibility == model.VisibilityPrivate && mProject.OwnerID != mUser.ID {
		return nil, fmt.Errorf("cannot record private project")
	}

	// 创建 Record
	mRecord := model.Record{
		UserID:       mUser.ID,
		ProjectID:    params.ProjectID,
		Name:         params.Name,
		Title:        params.Title,
		Description:  params.Description,
		VideoURL:     params.VideoURL,
		ThumbnailURL: params.ThumbnailURL,
		Duration:     params.Duration,
		FileSize:     params.FileSize,
		Visibility:   model.VisibilityPublic, // 默认公开
	}

	if err := ctrl.db.WithContext(ctx).Create(&mRecord).Error; err != nil {
		return nil, fmt.Errorf("failed to create record: %w", err)
	}

	// 预加载关联数据
	if err := ctrl.db.WithContext(ctx).
		Preload("User").
		Preload("Project.Owner").
		First(&mRecord, mRecord.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load record: %w", err)
	}

	recordDTO := toRecordDTO(mRecord)
	return &recordDTO, nil
}

// GetRecord gets a record by owner and name.
func (ctrl *Controller) GetRecord(ctx context.Context, owner, name string) (*RecordDTO, error) {
	record, err := ctrl.ensureRecord(ctx, owner, name, false)
	if err != nil {
		return nil, err
	}

	recordDTO := toRecordDTO(*record)
	return &recordDTO, nil
}

// ListRecordsOrderBy defines the available order by options
type ListRecordsOrderBy string

const (
	ListRecordsOrderByCreatedAt ListRecordsOrderBy = "createdAt"
	ListRecordsOrderByUpdatedAt ListRecordsOrderBy = "updatedAt"
	ListRecordsOrderByDuration  ListRecordsOrderBy = "duration"
	ListRecordsOrderByViewCount ListRecordsOrderBy = "viewCount"
	ListRecordsOrderByLikeCount ListRecordsOrderBy = "likeCount"
)

// IsValid reports whether the order by condition is valid.
func (ob ListRecordsOrderBy) IsValid() bool {
	switch ob {
	case ListRecordsOrderByCreatedAt,
		ListRecordsOrderByUpdatedAt,
		ListRecordsOrderByDuration,
		ListRecordsOrderByViewCount,
		ListRecordsOrderByLikeCount:
		return true
	}
	return false
}

// ListRecordsParams holds parameters for listing records.
type ListRecordsParams struct {
	// Owner filters records by owner username
	Owner *string

	// ProjectFullName filters records by associated project
	ProjectFullName *ProjectFullName

	// Keyword filters records by name or title
	Keyword *string

	// OrderBy specifies the field to order by
	OrderBy ListRecordsOrderBy

	// SortOrder specifies the sort direction
	SortOrder SortOrder

	// Pagination is the pagination information
	Pagination Pagination
}

// NewListRecordsParams creates a new ListRecordsParams with default values.
func NewListRecordsParams() *ListRecordsParams {
	return &ListRecordsParams{
		OrderBy:    ListRecordsOrderByCreatedAt,
		SortOrder:  SortOrderDesc,
		Pagination: Pagination{Index: 1, Size: 20},
	}
}

// Validate validates the ListRecordsParams.
func (p *ListRecordsParams) Validate() (ok bool, msg string) {
	if p.ProjectFullName != nil && !p.ProjectFullName.IsValid() {
		return false, "invalid projectFullName"
	}
	if !p.OrderBy.IsValid() {
		return false, "invalid orderBy"
	}
	if !p.SortOrder.IsValid() {
		return false, "invalid sortOrder"
	}
	if !p.Pagination.IsValid() {
		return false, "invalid pagination"
	}
	return true, ""
}

// ListRecords lists records with filtering and pagination.
func (ctrl *Controller) ListRecords(ctx context.Context, params *ListRecordsParams) (*ByPage[RecordDTO], error) {
	mUser, _ := authn.UserFromContext(ctx)
	
	query := ctrl.db.WithContext(ctx).Model(&model.Record{})
	
	// Apply owner filter
	if params.Owner != nil {
		query = query.Joins("JOIN user ON user.id = record.user_id").
			Where("user.username = ?", *params.Owner)
	} else if mUser != nil {
		// Default to current user's records if no owner specified and user is authenticated
		query = query.Where("record.user_id = ?", mUser.ID)
	} else {
		// For unauthenticated users, only show public records
		query = query.Where("record.visibility = ?", model.VisibilityPublic)
	}
	
	// Apply keyword filter
	if params.Keyword != nil {
		keyword := "%" + *params.Keyword + "%"
		query = query.Where("record.name LIKE ? OR record.title LIKE ?", keyword, keyword)
	}
	
	// Apply project filter
	if params.ProjectFullName != nil {
		query = query.Joins("JOIN project ON project.id = record.project_id").
			Joins("JOIN user AS project_owner ON project_owner.id = project.owner_id").
			Where("project_owner.username = ? AND project.name = ?", 
				params.ProjectFullName.Owner, params.ProjectFullName.Project)
	}
	
	// Count total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count records: %w", err)
	}
	
	// Apply ordering
	var queryOrderByColumn string
	switch params.OrderBy {
	case ListRecordsOrderByCreatedAt:
		queryOrderByColumn = "record.created_at"
	case ListRecordsOrderByUpdatedAt:
		queryOrderByColumn = "record.updated_at"
	case ListRecordsOrderByDuration:
		queryOrderByColumn = "record.duration"
	case ListRecordsOrderByViewCount:
		queryOrderByColumn = "record.view_count"
	case ListRecordsOrderByLikeCount:
		queryOrderByColumn = "record.like_count"
	}
	if queryOrderByColumn == "" {
		queryOrderByColumn = "record.created_at"
	}
	query = query.Order(fmt.Sprintf("%s %s, record.id", queryOrderByColumn, params.SortOrder))
	
	// Apply pagination and load records with associations
	var mRecords []model.Record
	if err := query.
		Preload("User").
		Preload("Project.Owner").
		Offset(params.Pagination.Offset()).
		Limit(params.Pagination.Size).
		Find(&mRecords).Error; err != nil {
		return nil, fmt.Errorf("failed to list records: %w", err)
	}
	
	// Convert to DTOs
	recordDTOs := make([]RecordDTO, len(mRecords))
	for i, mRecord := range mRecords {
		recordDTOs[i] = toRecordDTO(mRecord)
	}
	
	return &ByPage[RecordDTO]{
		Total: total,
		Data:  recordDTOs,
	}, nil
}