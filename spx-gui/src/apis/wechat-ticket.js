export default async function handler(req, res) {
  // 设置CORS头，允许前端访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { access_token, type } = req.query;
    
    if (!access_token || !type) {
      return res.status(400).json({ error: 'Missing access_token or type parameter' });
    }

    // 调用微信API
    const response = await fetch(
      `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=${type}`
    );

    const data = await response.json();
    
    // 返回微信API的响应
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Error fetching wechat ticket:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
