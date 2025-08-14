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