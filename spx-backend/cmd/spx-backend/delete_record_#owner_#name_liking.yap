// Unlike the specified record as the authenticated user.
//
// Request:
//   DELETE /record/:owner/:name/liking

import (
	"github.com/goplus/builder/spx-backend/internal/controller"
)

ctx := &Context
if _, ok := ensureAuthenticatedUser(ctx); !ok {
	return
}

owner := ${owner}
name := ${name}

err := ctrl.UnlikeRecord(ctx.Context(), owner, name)
if err != nil {
	replyWithInnerError(ctx, err)
	return
}
text 204, "", ""