#!/usr/bin/env node
const mongoose = require('mongoose')
const User = require('../models/user.model')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mh_data'
const email = process.argv[2]

if (!email) {
  console.error('Usage: node makeAdmin.js user@example.com')
  process.exit(2)
}

async function run() {
  await mongoose.connect(MONGO_URI)
  const user = await User.findOne({ gmail: email })
  if (!user) {
    console.error('No user found with email', email)
    process.exit(1)
  }
  user.role = 'admin'
  await user.save()
  console.log('User promoted to admin:', user.gmail)
  await mongoose.disconnect()
}

run().catch((err) => { console.error(err); process.exit(1) })
