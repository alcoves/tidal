const api = require('./api');
const gql = require('graphql-tag');
const shortId = require('shortid');

describe('makes api calls', () => {
  it('returns video query', async () => {
    const videoId = 'EN4MHVIH';
    const res = await api.query({
      query: gql`query {
        video(id: "${videoId}") {
          id
          status
          sourceFile
        }
      }`,
    });
    expect(res.data.video).toEqual({
      id: videoId,
      __typename: 'Video',
      status: 'completed',
      sourceFile: 'media-bken/videos/EN4MHVIH/source.mp4',
    });
  });

  it('updates a video', async () => {
    const videoId = 'EN4MHVIH';
    const newTitle = shortId();
    const res = await api.mutate({
      mutation: gql`mutation {
        updateVideo(id: "${videoId}", input: { title: "${newTitle}" }) {
          title
        }
      }`,
    });
    expect(res.data.updateVideo).toEqual({
      __typename: 'Video',
      title: newTitle,
    });
  });

  it('updated a video file', async () => {
    const videoId = 'EN4MHVIH';
    const preset = '1080p';
    const res = await api.mutate({
      mutation: gql`mutation {
        updateVideo(id: "${videoId}", input: { files : ${preset} : { 
          status: "completed"
          percentCompleted: 100,
          completedAt: "${new Date()}",
         }}) {
          id
        }
      }`,
    });
    expect(res.data.updateVideo).toEqual({
      __typename: 'Video',
      id: videoId,
    });
  });
});
