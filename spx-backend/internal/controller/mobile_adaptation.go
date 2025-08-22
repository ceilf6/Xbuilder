// spx-backend/internal/controller/mobile_adaptation.go
package controller

import (
	"context"
	"errors"
	"fmt"

	"github.com/goplus/builder/spx-backend/internal/authn"
	"github.com/goplus/builder/spx-backend/internal/model"
	"gorm.io/gorm"
)

// MobileAdaptationDTO is the DTO for mobile adaptations.
type MobileAdaptationDTO struct {
	ModelDTO

	ProjectFullName ProjectFullName    `json:"projectFullName"`
	AdaptationType  int                `json:"adaptationType"`
	ZoneToKey       map[string]*string `json:"zoneToKey,omitempty"`
}

// toMobileAdaptationDTO converts the model mobile adaptation to its DTO.
func toMobileAdaptationDTO(ma model.MobileAdaptation) MobileAdaptationDTO {
	dto := MobileAdaptationDTO{
		ModelDTO: toModelDTO(ma.Model),
		ProjectFullName: ProjectFullName{
			Owner:   ma.Project.Owner.Username,
			Project: ma.Project.Name,
		},
		AdaptationType: ma.AdaptationType,
	}

	// 转换 ZoneToKey 类型以便 JSON 序列化
	if ma.ZoneToKey != nil {
		dto.ZoneToKey = make(map[string]*string)
		for zone, key := range ma.ZoneToKey {
			dto.ZoneToKey[string(zone)] = key
		}
	}

	return dto
}

// CreateMobileAdaptationParams holds the parameters for creating mobile adaptation.
type CreateMobileAdaptationParams struct {
	ProjectFullName ProjectFullName    `json:"projectFullName"`
	AdaptationType  int                `json:"adaptationType"`
	ZoneToKey       map[string]*string `json:"zoneToKey,omitempty"`
}

// Validate validates the CreateMobileAdaptationParams.
func (p *CreateMobileAdaptationParams) Validate() (ok bool, msg string) {
	if !p.ProjectFullName.IsValid() {
		return false, "invalid projectFullName"
	}
	if p.AdaptationType < 1 || p.AdaptationType > 2 {
		return false, "invalid adaptationType, must be 1 (no keyboard) or 2 (custom keyboard)"
	}
	if p.AdaptationType == 2 && len(p.ZoneToKey) == 0 {
		return false, "zoneToKey is required when adaptationType is 2 (custom keyboard)"
	}
	if p.AdaptationType == 1 && len(p.ZoneToKey) > 0 {
		return false, "zoneToKey must be empty when adaptationType is 1 (no keyboard)"
	}

	// 验证 zone ID 是否有效
	if p.AdaptationType == 2 && p.ZoneToKey != nil {
		for zoneStr := range p.ZoneToKey {
			zone := model.ZoneId(zoneStr)
			if !zone.IsValid() {
				return false, fmt.Sprintf("invalid zone ID: %s", zoneStr)
			}
		}
	}

	return true, ""
}

// CreateMobileAdaptation creates a mobile adaptation for a project.
func (ctrl *Controller) CreateMobileAdaptation(ctx context.Context, params *CreateMobileAdaptationParams) (*MobileAdaptationDTO, error) {
	// 检查用户权限
	_, ok := authn.UserFromContext(ctx)
	if !ok {
		return nil, authn.ErrUnauthorized
	}

	// 验证参数
	if ok, msg := params.Validate(); !ok {
		return nil, fmt.Errorf("validation failed: %s", msg)
	}

	// 查找项目并检查权限（使用现有的 ensureProject 方法）
	mProject, err := ctrl.ensureProject(ctx, params.ProjectFullName, true)
	if err != nil {
		return nil, err
	}

	// 检查是否已存在移动端适配配置
	var existingMA model.MobileAdaptation
	if err := ctrl.db.WithContext(ctx).
		Where("project_id = ?", mProject.ID).
		First(&existingMA).Error; err == nil {
		return nil, fmt.Errorf("mobile adaptation already exists for project %q", params.ProjectFullName)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check existing mobile adaptation: %w", err)
	}

	// 转换 ZoneToKey 映射
	zoneToKey := make(model.ZoneToKeyMapping)
	if params.AdaptationType == 2 && params.ZoneToKey != nil {
		for zoneStr, key := range params.ZoneToKey {
			zone := model.ZoneId(zoneStr)
			zoneToKey[zone] = key
		}
	}

	// 创建移动端适配配置
	mMobileAdaptation := model.MobileAdaptation{
		ProjectID:      mProject.ID,
		AdaptationType: params.AdaptationType,
		ZoneToKey:      zoneToKey,
	}

	if err := ctrl.db.WithContext(ctx).Create(&mMobileAdaptation).Error; err != nil {
		return nil, fmt.Errorf("failed to create mobile adaptation: %w", err)
	}

	// 重新查询以获取完整的关联数据
	if err := ctrl.db.WithContext(ctx).
		Preload("Project.Owner").
		First(&mMobileAdaptation, mMobileAdaptation.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load mobile adaptation: %w", err)
	}

	mobileAdaptationDTO := toMobileAdaptationDTO(mMobileAdaptation)
	return &mobileAdaptationDTO, nil
}