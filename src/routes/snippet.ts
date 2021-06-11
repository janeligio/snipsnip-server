import express from 'express'
import { authenticateUser, validateUserAuthenticity } from '../middleware/authenticator'
const router = express.Router()
import Snippet from '../mongoose/models/Snippet'

function createSnippet (data, success, failure) {
    const snippet = new Snippet(data)

    snippet.save(err => {
        if (err) {
            failure(err)
        } else {
            success()
        }
    })
}

/**
 * @route GET /snippets/
 * @description Get all snippets
 * @access Public
 */
router.get('/', async (req, res) => {
    console.log(req.headers.host);
    try {
        const snippets = await Snippet.find({});
        res.status(200).send(snippets);
    } catch (err) {
        console.error(err)
        res.status(500).send('Error');
    }
})

/**
 * @route GET /snippets/:snippetId
 * @description Get a specific snippet.
 * @access Public
 */
router.get('/snippet/:snippetId', async (req, res) => {
    const { snippetId } = req.params;

    if (snippetId) {
        try {
            const snippet = await Snippet.findById(snippetId).exec();
            res.json(snippet);
        } catch (err) {
            res.json({error: 'Could not find snippet'});
        }
    } else {
        res.json({error: 'Must specify snippet id'});
    }
})

/**
 * @route POST /snippets/
 * @description Post a snippet
 * @access Private
 */
router.post('/', authenticateUser, (req, res) => {
    const { id, author, title, description, code, tags, likes, isPrivate } = req.body;
    console.log(req.body);

    const data = { owner: id, author, title, description, code, tags, likes, isPrivate };
    const successCallback = () => res.status(200).send('Created snippet');
    const failureCallback = (err) => res.status(500).json(err);
    createSnippet(data, successCallback, failureCallback);
})

export default router;