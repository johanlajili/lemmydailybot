import dotenv from 'dotenv';
import { LemmyHttp } from 'lemmy-js-client';
import cron from 'node-cron';
import moment from 'moment';
import fs from 'fs';

dotenv.config();

const instanceUrl: string = process.env.LEMMY_INSTANCE_URL!;
const username: string = process.env.LEMMY_USERNAME!;
const password: string = process.env.LEMMY_PASSWORD!;

let lemmyClient = new LemmyHttp(instanceUrl);

const login = async () => {
  let loginRes = await lemmyClient.login({
    username_or_email: username,
    password: password
  });
  return loginRes.jwt;
};

const makePost = async (jwt, communityId, title, content) => {
  let createPostRes = await lemmyClient.createPost({
    auth: jwt,
    community_id: communityId,
    name: title,
    body: content
  });
  console.log(`Created post ${createPostRes.post_view.post.id} - ${title}`)

  lemmyClient.featurePost({
    auth: jwt,
    post_id: createPostRes.post_view.post.id,
    featured: true,
    feature_type: 'Community'
  });

  console.log(`Pinned post ${createPostRes.post_view.post.id} - ${title}`)
  return createPostRes.post_view.post.id;
};

const unpinOldPosts = async (jwt, communityId) => {
  let listPostsRes = await lemmyClient.getPosts({
    auth: jwt,
    community_id: communityId
  })
  for(let post of listPostsRes.posts) {
    if(post.post.featured_community && post.post.name.match(/\d{4}-\d{2}-\d{2}$/)) {
      let dateInTitle = post.post.name.match(/\d{4}-\d{2}-\d{2}$/)?.[0];
      if(dateInTitle !== moment().format('YYYY-MM-DD')) {
        await lemmyClient.featurePost({
          auth: jwt,
          post_id: post.post.id,
          featured: false,
          feature_type: 'Community'
        });

        console.log(`Unpinned post ${post.post.id} - ${post.post.name}`);
      }
    }
  }
};

const runBot = async () => {
  let jwt = await login();
  
  // Read the JSON file
  let dailyPosts = JSON.parse(fs.readFileSync('./daily_posts.json', 'utf-8'));
  
  let dayOfWeek = moment().format('dddd').toLowerCase();
  let postDetails = dailyPosts[dayOfWeek];
  
  if(!postDetails) {
    console.log(`No post configuration found for ${dayOfWeek}`);
    return;
  }

  let communityId = postDetails.communityId;
  let title = `${postDetails.title} ${moment().format('YYYY-MM-DD')}`;
  let content = postDetails.content;

  await unpinOldPosts(jwt, communityId);
  await makePost(jwt, communityId, title, content);
};

// Schedule the task to run every day at 6 AM French Time.
cron.schedule('0 6 * * *', runBot, { timezone: 'Europe/Paris' });