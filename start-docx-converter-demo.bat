@echo off
chcp 65001 >nul
echo ========================================
echo   Word 文档转 Markdown 功能演示
echo ========================================
echo.
echo 正在启动服务...
echo.

echo [1/2] 启动后端服务...
cd backend
start "后端服务 - NestJS" cmd /k "npm run start:dev"
timeout /t 3 /nobreak >nul

echo [2/2] 启动前端服务...
cd ..\frontend
start "前端服务 - Vue" cmd /k "npm run dev"

echo.
echo ✅ 服务启动中，请稍候...
echo.
echo 📝 使用说明：
echo    1. 等待后端服务启动完成（约10秒）
echo    2. 等待前端服务启动完成（约5秒）
echo    3. 浏览器访问：http://localhost:5173/tools/docx-converter
echo    4. 上传 .docx 文件进行测试
echo.
echo 💡 提示：
echo    - 支持拖拽上传
echo    - 文件大小限制 10MB
echo    - 转换完成后可复制或下载
echo.
echo ========================================
pause

