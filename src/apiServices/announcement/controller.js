import Announcement from "./model.js";

const getMessage = async (req, res, next) => {
    try {
        const announcements = await Announcement.findOne({})
        res.json(announcements)

    } catch (err) {
        next(err)
    }
}

const setMessage = async (req, res, next) => {
    try {
        const { user_name } = req.user
        const { text } = req.body

        if (!text) return res.json({ error: 'No text' })

        const announcements = await Announcement.find({})

        if (!announcements) {
            const newAnnoun = await Announcement.create({
                messages: [
                    {
                        ...req.body,
                        from: user_name
                    }
                ]
            })
            return res.json({ announcements: newAnnoun.messages })
        } else {
            announcements.messages = [
                {
                    ...req.body,
                    from: user_name
                }
            ]
            await announcements.save()
            return res.json({ announcements: announcements.messages })
        }

    } catch (err) {
        next(err)
    }
}

const deleteMessage = async (req, res, next) => {
    try {
        const announcements = await Announcement.find({})

        if (!announcements) {
            const newAnnoun = await Announcement.create({
                messages: []
            })
            return res.json({ announcements: newAnnoun.messages })
        } else {
            announcements.messages = []
            await announcements.save()
            return res.json({ announcements: announcements.messages })
        }

    } catch (err) {
        next(err)
    }
}

export {
    getMessage,
    setMessage,
    deleteMessage
}