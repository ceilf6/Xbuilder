// Check if the authenticated user is liking the specified record.
//
// Request:
//   GET /record/:owner/:name/liking

import (
	"github.com/goplus/builder/spx-backend/internal/controller"
)

ctx := &Context

owner := ${owner}
name := ${name}

isLiking, err := ctrl.IsLikingRecord(ctx.Context(), owner, name)
if err != nil {
	replyWithInnerError(ctx, err)
	return
}

if !isLiking {
	text 404, "", ""
	return
}

text 204, "", ""