/* eslint-disable semi */
import express from 'express'
import { authenticateUser, validateUserAuthenticity } from '../middleware/authenticator'
import { validateSnippet } from '../util/validation';
const router = express.Router()
import Snippet from '../mongoose/models/Snippet'

function createSnippet(data, success, failure) {
    const snippet = new Snippet(data)

    snippet.save(err => {
        if (err) {
            failure(err)
        } else {
            success()
        }
    })
}

function editSnippet(snippet, success, failure) {
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
 * @route GET /snippets/snippet/:snippetId
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
            res.json({ error: 'Could not find snippet' });
        }
    } else {
        res.json({ error: 'Must specify snippet id' });
    }
})

/**
 * @route GET /snippets/:userId
 * @description Get someone's snippets
 * @access Public
 */
router.get('/:userId', authenticateUser, async (req, res) => {
    const { userId } = req.params;

    if (userId) {
        const snippets = await Snippet.find({ owner: userId }).exec();
        console.log(snippets);
        res.json(snippets);
    }
});
/**
 * @route POST /snippets/
 * @description Post a snippet
 * @access Private
 */
router.post('/', authenticateUser, async (req, res) => {
    const { id, author, title, description, code, tags, likes, isPrivate } = req.body;
    console.log(req.body);
    const { isValid, errors } = await validateSnippet({ title, description, code });

    if (!isValid) {
        res.status(500);
        res.json({ error: errors });
    } else {
        const data = { owner: id, author, title, description, code, tags, likes, isPrivate };
        const successCallback = () => res.status(200).send('Created snippet');
        const failureCallback = (err) => res.status(500).json(err);
        createSnippet(data, successCallback, failureCallback);
    }
})

/**
 * @route DELETE /snippets/:snippetId
 * @description Delete a snippet from the database
 * @access Private
 */
router.delete('/:snippetId', authenticateUser, async (req, res) => {
    const { snippetId } = req.params;
    const { auth } = res.locals;

    if (snippetId && auth) {
        try {
            const snippet: any = await Snippet.findById(snippetId, 'owner').exec();
            if (snippet.owner.toString() === auth.id) {
                // Delete snippet
                try {
                    await Snippet.deleteOne({ _id: snippetId });
                    res.json({ message: `Successfully deleted snippet ${snippetId}` });
                } catch (err) {
                    res.json({ error: err })
                }
            } else {
                // If requester is not the owner of the snippet they are forbidden
                res.status(403).json({ error: 'FORBIDDEN' });
            }
        } catch (err) {
            res.json({ error: 'Snippet does not exist.' })
        }
    }
})

/**
 * @route PUT /snippets/edit/:snippetId
 * @description Edit a snippet
 * @access Private
 */
 router.put('/edit/', authenticateUser, async (req, res) => {
    const { id, author, title, description, code, tags, likes, isPrivate } = req.body;
    //const { snippetId } = req.params;
    const { snippetId, userId } = req.query;
    console.log(typeof(isPrivate));
    const { isValid, errors } = await validateSnippet({ author, title, description, code, isPrivate });
    console.log(validateSnippet({ author, title, description, code, isPrivate }));

    if (snippetId) {
        if (isValid) {
            // Private access - Editing your own snippet
            console.log(validateUserAuthenticity(res.locals, userId));

            if (validateUserAuthenticity(res.locals, userId)) {
                console.log("You are who you are")
                try {
                    const snippet: any = await Snippet.findById(snippetId).exec();
                    snippet.author = author;
                    snippet.title = title;
                    snippet.description = description;
                    snippet.code = code;
                    snippet.isPrivate = isPrivate;
                    console.log('snippet:', snippet);
                    const successCallback = () => res.status(200).send('Updated snippet information');
                    const failureCallback = (err) => res.status(500).json(err);
                    editSnippet(snippet, successCallback, failureCallback);
                } catch (err) {
                    res.status(404).json({ error: 'Snippet does not exist.' });
                }
            }
        } else {
            res.json({ error: errors });
        }
    } else {
        res.json({ error: 'Must specify snippetid' });
    }
})

export default router;