# 语文提高训练 · Docker 镜像
FROM python:3.14-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制全部文件
COPY . .

# 暴露端口
EXPOSE 3200

# 启动
CMD ["python", "main.py"]
