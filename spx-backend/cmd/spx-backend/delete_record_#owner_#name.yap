// Delete a record.
//
// Request:
//   DELETE /record/:owner/:name

import (
	"github.com/goplus/builder/spx-backend/internal/controller"
)

ctx := &Context
if _, ok := ensureAuthenticatedUser(ctx); !ok {
	return
}

owner := ${owner}
name := ${name}

err := ctrl.DeleteRecord(ctx.Context(), owner, name)
if err != nil {
	replyWithInnerError(ctx, err)
	return
}
text 204, "", ""