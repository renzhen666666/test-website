const axios = require('axios');

async function testServer() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('开始测试服务器功能...');
  
  try {
    // 启动服务器（异步）
    const server = require('./server.js');
    
    // 稍等服务器启动
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 测试主页
    console.log('1. 测试主页...');
    const homeResponse = await axios.get(`${baseUrl}/`);
    console.log(`   主页状态码: ${homeResponse.status}`);
    
    // 测试错误页面（使用axios配置来允许非2xx状态码）
    console.log('2. 测试错误页面...');
    
    try {
      const error404Response = await axios.get(`${baseUrl}/error/404`, { validateStatus: () => true });
      console.log(`   404页面状态码: ${error404Response.status}`);
    } catch (e) {
      console.log(`   404页面访问失败: ${e.message}`);
    }
    
    try {
      const error500Response = await axios.get(`${baseUrl}/error/500`, { validateStatus: () => true });
      console.log(`   500页面状态码: ${error500Response.status}`);
    } catch (e) {
      console.log(`   500页面访问失败: ${e.message}`);
    }
    
    try {
      const error502Response = await axios.get(`${baseUrl}/error/502`, { validateStatus: () => true });
      console.log(`   502页面状态码: ${error502Response.status}`);
    } catch (e) {
      console.log(`   502页面访问失败: ${e.message}`);
    }
    
    // 测试上传页面
    console.log('3. 测试上传页面...');
    try {
      const uploadResponse = await axios.get(`${baseUrl}/upload`, { validateStatus: () => true });
      console.log(`   上传页面状态码: ${uploadResponse.status}`);
    } catch (e) {
      console.log(`   上传页面访问失败: ${e.message}`);
    }
    
    // 测试测试页面
    console.log('4. 测试测试页面...');
    try {
      const testResponse = await axios.get(`${baseUrl}/test`, { validateStatus: () => true });
      console.log(`   测试页面状态码: ${testResponse.status}`);
    } catch (e) {
      console.log(`   测试页面访问失败: ${e.message}`);
    }
    
    // 测试404处理
    console.log('5. 测试404处理...');
    try {
      const notFoundResponse = await axios.get(`${baseUrl}/nonexistent-page`, { validateStatus: () => true });
      console.log(`   未找到页面状态码: ${notFoundResponse.status}`);
    } catch (e) {
      console.log(`   404处理测试失败: ${e.message}`);
    }
    
    console.log('\n所有测试完成！');
    
    // 关闭服务器
    if (server && server.listen) {
      // 如果server有关闭方法则调用
    }
  } catch (error) {
    console.error('测试过程中出现错误:', error.message);
  }
}

testServer();