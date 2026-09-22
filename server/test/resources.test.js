const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const app = require('../src/app')
const Game = require('../src/models/game.model')
const User = require('../src/models/user.model')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  await mongoose.connection.db.dropDatabase()
})

test('create and update item resource', async () => {
  const game = await Game.create({ title: 'Test Game', slug: 'test-game' })
  const res = await request(app).post('/api/items').send({ game: game._id.toString(), name: 'Test Item', slug: 'test-item', category: 'material', rarity: 1 })
  expect(res.statusCode).toBe(201)
  expect(res.body.name).toBe('Test Item')
  const id = res.body._id
  const update = await request(app).patch(`/api/items/${id}`).send({ rarity: 2 })
  expect(update.statusCode).toBe(200)
  expect(update.body.rarity).toBe(2)
})

test('delete item resource', async () => {
  const game = await Game.create({ title: 'Delete Game', slug: 'delete-game' })
  const admin = await User.create({ name: 'Admin', gmail: 'admin@example.com', password: 'x', role: 'admin' })
  const token = jwt.sign({ id: admin._id, name: admin.name, gmail: admin.gmail }, JWT_SECRET)
  const res = await request(app).post('/api/items').send({ game: game._id.toString(), name: 'Delete Item', slug: 'delete-item', category: 'material', rarity: 1 })
  expect(res.statusCode).toBe(201)
  const id = res.body._id
  const del = await request(app).delete(`/api/items/${id}`).set('Authorization', `Bearer ${token}`)
  expect(del.statusCode).toBe(204)
  const get = await request(app).get(`/api/items/${id}`)
  expect(get.statusCode).toBe(404)
})

test('create and delete monster resource', async () => {
  const game = await Game.create({ title: 'Monster Game', slug: 'monster-game' })
  const admin = await User.create({ name: 'Admin2', gmail: 'admin2@example.com', password: 'x', role: 'admin' })
  const token = jwt.sign({ id: admin._id, name: admin.name, gmail: admin.gmail }, JWT_SECRET)
  const res = await request(app).post('/api/monsters').send({ game: game._id.toString(), name: 'Delete Monster', slug: 'delete-monster', classification: 'large' })
  expect(res.statusCode).toBe(201)
  const id = res.body._id
  const del = await request(app).delete(`/api/monsters/${id}`).set('Authorization', `Bearer ${token}`)
  expect(del.statusCode).toBe(204)
  const get = await request(app).get(`/api/monsters/${id}`)
  expect(get.statusCode).toBe(404)
})
