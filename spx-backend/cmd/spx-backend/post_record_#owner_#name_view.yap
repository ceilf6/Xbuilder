// Record a view for the specified record as the authenticated user.
//
// Request:
//   POST /record/:owner/:name/view

import (
	"github.com/goplus/builder/spx-backend/internal/controller"
)

ctx := &Context
if _, ok := ensureAuthenticatedUser(ctx); !ok {
	return
}

owner := ${owner}
name := ${name}

err := ctrl.RecordRecordView(ctx.Context(), owner, name)
if err != nil {
	replyWithInnerError(ctx, err)
	return
}
text 204, "", ""