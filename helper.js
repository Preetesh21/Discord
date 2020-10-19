require('dotenv').config
const { Octokit } = require('@octokit/rest')

const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
})

const keyTopic = 'hacktoberfest'
const keyPrLabel = 'hacktoberfest-accepted'
const validUrlPrefix = 'https://github.com/'
const moderationAccount = 'hacktoberfest-team'

const getRepo = async(owner, repo) => {
    try {
        return await octokit.repos.get({
            owner,
            repo,
        })
    } catch (err) {
        console.log("Not a Repo")
    }
    return false;
}

const getTopics = async(repo) => {
    const {
        data: { names: topics },
    } = await octokit.repos.getAllTopics({
        owner: repo.owner.login,
        repo: repo.name,
    })

    return topics
}

const getPulls = async(repo) => {
    const { data: pulls } = await octokit.pulls.list({
        owner: repo.owner.login,
        repo: repo.name,
        state: 'all',
    })

    return pulls
}

const getBannedIssues = async(repo) => {
    const { data: issues } = await octokit.issues.listForRepo({
        owner: repo.owner.login,
        repo: repo.name,
        creator: moderationAccount,
    })

    return issues.filter(
        (i) => i.title === 'Pull requests here won’t count toward Hacktoberfest.'
    )
}

const hasTopic = (topics) => {
    return topics.includes(keyTopic)
}

const hasTaggedPrs = (pulls) => {
    return (
        pulls.filter((p) => {
            return p.labels.filter((l) => l.name === keyPrLabel).length > 0
        }).length > 0
    )
}

const getValidUrl = (url) => {
    if (!url.startsWith(validUrlPrefix)) {
        return false;
    }

    url = new URL(url)
    const [, repoOwner, repoName] = url.pathname.split('/')

    return {
        repoOwner,
        repoName,
    }
}

const app = async(url) => {
    var d = new Date();
    if (d.getMonth() + 1 != 10) {
        return "Try in OCtober!!!"
    }
    if (!getValidUrl(url)) {
        return "It's not a Github Repository Link!!!"
    }
    try {
        const { repoOwner, repoName } = getValidUrl(url)
        if ((repoName === undefined || repoOwner === undefined) || !(await getRepo(repoOwner, repoName))) {
            return "It's not a valid Github Repository!!!"
        }
        const { data: repo } = await getRepo(repoOwner, repoName)
        const topics = await getTopics(repo)
        const pulls = await getPulls(repo)
        const bannedIssues = await getBannedIssues(repo)
        const isBanned = bannedIssues.length > 0

        const body = {
                name: repo.name,
                long_name: `${repoOwner}/${repoName}`,
                description: repo.description,
                url: repo.html_url,
                requested_at: new Date(),
                topics,
                topic: hasTopic(topics),
                tag_prs: hasTaggedPrs(pulls),
                open_help_wanted_issue_count: repo.open_issues_count,
                repo_updated_at: repo.updated_at,
                language: repo.language,
                license: repo.license,
                forks: repo.forks,
                stargazers_count: repo.stargazers_count,
                banned: isBanned,
                banned_url: isBanned ? bannedIssues.shift().html_url : null,
            }
            //console.log(body)
        if (body.topic || body.tag_prs && !banned) {
            console.log("Eligible");
            return "The repository is Eligible";
        } else {
            console.log("Not Eligible.");
            return "The repository is Not Eligible";
        }

    } catch (error) {
        console.log(error)
        return "Some Error Occurred."
    }
}
module.exports = app;