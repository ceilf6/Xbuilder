package model

// Record is the model for project recording videos.
type Record struct {
	Model

	// UserID is the ID of the user who created the record.
	UserID int64 `gorm:"column:user_id;index;index:,composite:user_id_name,unique"`
	User   User  `gorm:"foreignKey:UserID"`

	// ProjectID is the ID of the project that the record is associated with.
	ProjectID int64   `gorm:"column:project_id;index"`
	Project   Project `gorm:"foreignKey:ProjectID"`

	// Name is the unique name of the record under the user.
	Name string `gorm:"column:name;index:,class:FULLTEXT;index:,composite:user_id_name,unique"`

	// Title is the display title of the record.
	Title string `gorm:"column:title"`

	// Description is the brief description of the record.
	Description string `gorm:"column:description"`

	// VideoURL is the URL of the recorded video file.
	VideoURL string `gorm:"column:video_url"`

	// ThumbnailURL is the URL of the thumbnail image.
	ThumbnailURL string `gorm:"column:thumbnail_url"`

	// Duration is the duration of the video in seconds.
	Duration int64 `gorm:"column:duration"`

	// FileSize is the size of the video file in bytes.
	FileSize int64 `gorm:"column:file_size"`

	// Visibility is the visibility of the record.
	Visibility Visibility `gorm:"column:visibility;index;default:1"` // default public

	// ViewCount is the number of times the record has been viewed.
	ViewCount int64 `gorm:"column:view_count;index"`

	// LikeCount is the number of times the record has been liked.
	LikeCount int64 `gorm:"column:like_count;index"`

	// Migration only fields. Do not use in application code.
	MO__deleted_at_is_null _deleted_at_is_null `gorm:"->:false;<-:false;column:_deleted_at_is_null;index:,composite:user_id_name,unique"`
}

// TableName implements [gorm.io/gorm/schema.Tabler].
func (Record) TableName() string {
	return "record"
}