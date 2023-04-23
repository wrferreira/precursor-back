"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const PORT = process.env.PORT || 3333;
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
});
const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => { console.log('Precursor'); });
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield pool.query('SELECT * FROM users');
        res.status(200).send(rows);
    }
    catch (err) {
        return res.status(400).send(err);
    }
}));
app.post('/session', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    try {
        user = yield pool.query('SELECT * FROM users WHERE user_name = ($1)', [username]);
        if (!user.rows[0]) {
            user = yield pool.query('INSERT INTO users (user_name) VALUES ($1) RETURNING *', [username]);
        }
        return res.status(200).send(user.rows);
    }
    catch (err) {
        return res.status(400).send(err);
    }
}));
app.post('/video/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, done } = req.body;
    const { user_id } = req.params;
    try {
        const newVideo = yield pool.query('INSERT INTO videos (description, video_done, user_id) VALUES ($1, $2, $3) RETURNING *', [description, done, user_id]);
        return res.status(200).send(newVideo.rows);
    }
    catch (err) {
        return res.status(400).send(err);
    }
}));
app.get('/video', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newVideo = yield pool.query('SELECT * FROM videos');
        return res.status(200).send(newVideo.rows);
    }
    catch (err) {
        return res.status(400).send(err);
    }
}));
app.get('/video/:user_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    try {
        const newVideo = yield pool.query('SELECT * FROM videos WHERE user_id = ($1)', [user_id]);
        return res.status(200).send(newVideo.rows);
    }
    catch (err) {
        return res.status(400).send(err);
    }
}));
app.patch('/video/:user_id/:video_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, video_id } = req.params;
    const data = req.body;
    try {
        const belongsUser = yield pool.query('SELECT * FROM videos WHERE user_id = ($1) AND video_id = ($2)', [user_id, video_id]);
        if (!belongsUser.rows[0])
            return res.status(400).send('Operation not allowed');
        const updatedVideo = yield pool.query('UPDATE videos SET description = ($1), video_done = ($2) WHERE video_id = ($3) RETURNING *', [data.description, data.done, video_id]);
        return res.status(200).send(updatedVideo.rows);
    }
    catch (err) {
        return res.status(400).send(err);
    }
}));
app.delete('/video/:user_id/:video_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, video_id } = req.params;
    try {
        const belongsUser = yield pool.query('SELECT * FROM videos WHERE user_id = ($1) AND video_id = ($2)', [user_id, video_id]);
        if (!belongsUser.rows[0])
            return res.status(400).send('Operation not allowed');
        const deletedVideo = yield pool.query('DELETE FROM videos WHERE video_id = ($1) RETURNING *', [video_id]);
        return res.status(200).send({
            "message": "Video sucessfully deleted",
            "videoDeleted": deletedVideo.rows
        });
    }
    catch (err) {
        return res.status(400).send(err);
    }
}));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
