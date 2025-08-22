// Create a mobile adaptation for a project.
//
// Request:
//   POST /project/:owner/:name/mobile-adaptation

import (
	"github.com/goplus/builder/spx-backend/internal/controller"
)

ctx := &Context
if _, ok := ensureAuthenticatedUser(ctx); !ok {
	return
}

// 从 URL 参数构建 ProjectFullName
projectFullName := controller.ProjectFullName{Owner: ${owner}, Project: ${name}}

params := &controller.CreateMobileAdaptationParams{}
if !parseJSON(ctx, params) {
	return
}

// 设置从 URL 解析的 ProjectFullName
params.ProjectFullName = projectFullName

if ok, msg := params.Validate(); !ok {
	replyWithCodeMsg(ctx, errorInvalidArgs, msg)
	return
}

mobileAdaptation, err := ctrl.CreateMobileAdaptation(ctx.Context(), params)
if err != nil {
	replyWithInnerError(ctx, err)
	return
}

json 201, mobileAdaptation