// Update a record.
//
// Request:
//   PUT /record/:owner/:name

import (
	"github.com/goplus/builder/spx-backend/internal/controller"
)

ctx := &Context
if _, ok := ensureAuthenticatedUser(ctx); !ok {
	return
}

params := &controller.UpdateRecordParams{}
if !parseJSON(ctx, params) {
	return
}
if ok, msg := params.Validate(); !ok {
	replyWithCodeMsg(ctx, errorInvalidArgs, msg)
	return
}

owner := ${owner}
name := ${name}
record, err := ctrl.UpdateRecord(ctx.Context(), owner, name, params)
if err != nil {
	replyWithInnerError(ctx, err)
	return
}
json record