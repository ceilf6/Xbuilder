// Get record by owner and name.
//
// Request:
//   GET /record/:owner/:name

import (
	"github.com/goplus/builder/spx-backend/internal/controller"
)

ctx := &Context

// 使用yap的标准参数获取语法
owner := ${owner}
name := ${name}

// 使用controller方法获取record
record, err := ctrl.GetRecord(ctx.Context(), owner, name)
if err != nil {
	replyWithInnerError(ctx, err)
	return
}

json record