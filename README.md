# Real-Time Scalable Chat Application (AWS Kinesis + Docker + MERN)

A production-style real-time chat system built using **event-driven architecture** with AWS Kinesis, Dockerized microservices, and MongoDB Atlas.

---

## Overview

This project demonstrates how to build a **highly scalable chat system** using:

- **AWS Kinesis** for real-time stream processing
- **Producer-Consumer architecture** for decoupled services
- **Docker Compose** for container orchestration
- **MongoDB Atlas** for persistent storage
- **React.js + Socket.io** for real-time UI

---

## Architecture
Frontend (React)
│
▼
Producer Service (Node.js API)
│
▼
AWS Kinesis Stream
│
▼
Consumer Service (Node.js Worker)
│
▼
MongoDB Atlas
│
▼
Backend API (Read)
│
▼
Frontend UI


---

## Flow

1. User sends message from frontend
2. Message is sent to **Producer API**
3. Producer pushes message to **AWS Kinesis**
4. Kinesis stores message in stream shards
5. Consumer reads messages from Kinesis
6. Consumer saves messages into **MongoDB Atlas**
7. Frontend fetches messages from backend API
8. UI updates with chat messages

---

## Tech Stack

### Frontend
- React.js
- Zustand
- Tailwind CSS
- Socket.io-client

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Socket.io

### AWS
- Kinesis (Streaming)

### DevOps
- Docker
- Docker Compose

---

## Services

###  Producer Service
- Accepts chat messages via REST API
- Pushes messages to Kinesis stream

###  Consumer Service
- Reads messages from Kinesis
- Processes and stores messages in MongoDB

###  Backend API
- Reads messages from DB
- Serves data to frontend

---

##  Docker Setup

### Run the application

docker-compose up --build
Stop containers
docker-compose down
Environment Variables

Create .env file:

AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY

MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
**API Endpoints**
Send Message (Producer)
POST /api/messages/send/:receiverId
Get Messages (Backend)
GET /api/messages/:conversationId

**Key Features**
Real-time messaging with Socket.io
Event-driven architecture using Kinesis
Scalable producer-consumer model
Dockerized microservices
MongoDB Atlas integration
Optimistic UI updates
**Scalability**
Producer → horizontally scalable
Kinesis → shard-based scaling
Consumer → multiple workers
Database → MongoDB Atlas scaling
**Trade-offs**
Slight delay due to async processing
Solved using optimistic UI updates
**Future Improvements**
Add WebSockets for instant delivery
Implement message retry & DLQ
Add Redis caching layer
Use AWS Lambda instead of consumer service

# ARCHITECTURE EXPLANATION (ADD AS SEPARATE SECTION)

Add this **below README or as ARCHITECTURE.md**

---

## System Design Explanation

### Goal

To build a **scalable, fault-tolerant real-time chat system** capable of handling high concurrency using event-driven architecture.

---

### Write Path (Event-driven)

User → Frontend → Producer → Kinesis → Consumer → MongoDB

- Messages are not directly written to DB
- Kinesis acts as a buffer and streaming layer
- Ensures high throughput and decoupling

---

### Read Path (Query-based)

Frontend → Backend API → MongoDB → UI

- Fast retrieval of messages
- Optimized for low latency

---

### Key Design Pattern

**CQRS (Command Query Responsibility Segregation)**

- Writes handled via Kinesis
- Reads handled via MongoDB

---

### Benefits

- High scalability
- Loose coupling
- Fault tolerance
- Independent service scaling

---

### Scaling Strategy

| Layer        | Scaling Method              |
|-------------|---------------------------|
| Producer     | Horizontal scaling         |
| Kinesis      | Increase shards            |
| Consumer     | Multiple consumers         |
| Database     | MongoDB Atlas scaling      |

---

### Failure Handling

- Kinesis retains messages (replay possible)
- Consumer retries processing
- Ensures no message loss

---

### Latency Handling

- Async processing introduces delay
- Solved using **optimistic UI updates**

---

### Future Enhancements

- WebSocket push instead of polling
- Dead Letter Queue (DLQ)
- Exactly-once processing
- Message ordering guarantees

---
## Author
Lavanya B
