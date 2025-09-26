// /netlify/functions/updateData.js
const { Octokit } = require("@octokit/rest");

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { GITHUB_USER, GITHUB_REPO, GITHUB_TOKEN } = process.env;
    const DATA_FILE = 'database.json';
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    try {
        const newData = JSON.parse(event.body);
        let currentData = [];
        let fileSha = undefined;

        try {
            const { data: fileData } = await octokit.repos.getContent({
                owner: GITHUB_USER,
                repo: GITHUB_REPO,
                path: DATA_FILE,
            });
            currentData = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
            fileSha = fileData.sha;
        } catch (e) {
            // 파일이 없으면 그냥 진행 (404 오류)
        }

        currentData.push(newData);

        await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_USER,
            repo: GITHUB_REPO,
            path: DATA_FILE,
            message: `Add new photo set at ${new Date().toISOString()}`,
            content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
            sha: fileSha,
        });

        return { statusCode: 200, body: JSON.stringify({ message: "Success" }) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};