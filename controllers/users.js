const router = require('express').Router()
const { User, Blog } = require('../models')
const { Op } = require('sequelize')

const findUserByUsername = async (req, res, next) => {
  req.user = await User.findOne({ where: { username: req.params.username } })
  next()
}

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

router.post('/', async (req, res) => {
  const user = await User.create(req.body)
  res.json(user)
})

router.get('/:id', async (req, res) => {
  const where = {}

  if (req.query.read) {
    where.read = { [Op.is]: JSON.parse(req.query.read) }
  }

  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: [''] } ,
    include: [
      {
        model: Blog,
        as: 'readings',
        attributes: { exclude: ['userId'] },
        through: {
          as: 'readinglists',
          attributes: { exclude: ['userId', 'blogId'] },
          // implements /:id?read=true/false
          where
        },
      }
    ]
  })

  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

router.put('/:username', findUserByUsername, async (req, res) => {
  if (req.user) {
    req.user.username = req.body.username
    await req.user.save()
    res.json(req.user)
  } else {
    res.status(404).end()
  }
})

module.exports = router