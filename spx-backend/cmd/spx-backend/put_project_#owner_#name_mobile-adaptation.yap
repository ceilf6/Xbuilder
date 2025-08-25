// Update mobile adaptation for a project.
//
// Request:
//   PUT /project/:owner/:name/mobile-adaptation

import (
	"github.com/goplus/builder/spx-backend/internal/controller"
)

ctx := &Context
if _, ok := ensureAuthenticatedUser(ctx); !ok {
	return
}

projectFullName := controller.ProjectFullName{Owner: ${owner}, Project: ${name}}
params := &controller.UpdateMobileAdaptationParams{}
if !parseJSON(ctx, params) {
	return
}

if ok, msg := params.Validate(); !ok {
	replyWithCodeMsg(ctx, errorInvalidArgs, msg)
	return
}

mobileAdaptation, err := ctrl.UpdateMobileAdaptation(ctx.Context(), projectFullName, params)
if err != nil {
	replyWithInnerError(ctx, err)
	return
}
json mobileAdaptation