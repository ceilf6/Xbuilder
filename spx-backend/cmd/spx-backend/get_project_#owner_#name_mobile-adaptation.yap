// Get mobile adaptation for a project.
//
// Request:
//   GET /project/:owner/:name/mobile-adaptation

import (
	"github.com/goplus/builder/spx-backend/internal/controller"
)

ctx := &Context

projectFullName := controller.ProjectFullName{Owner: ${owner}, Project: ${name}}
mobileAdaptation, err := ctrl.GetMobileAdaptation(ctx.Context(), projectFullName)
if err != nil {
	replyWithInnerError(ctx, err)
	return
}

json mobileAdaptation