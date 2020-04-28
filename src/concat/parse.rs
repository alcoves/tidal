use clap;
use std::env;

pub struct ConcatArgs {
  pub mode: String,
  pub preset: String,
  pub work_dir: String,
  pub video_id: String,
  pub manifest_path: String,
  pub local_audio_path: String,
  pub remote_audio_path: String,
  pub local_segment_path: String,
  pub remote_segment_path: String,
  pub remote_transcoded_path: String,
  pub local_transcoded_no_audio_path: String,
  pub local_transcoded_with_audio_path: String,
}

impl ConcatArgs {
  pub fn new(matches: clap::ArgMatches) -> ConcatArgs {
    // TODO :: Should use uuid instead of video_id
    let cwd = env::current_dir().unwrap();
    let current_dir = &cwd.display();
    let preset = matches.value_of("preset").unwrap().to_string();
    let video_id = matches.value_of("video_id").unwrap().to_string();
    let work_dir = format!("{}/tmp/{}", current_dir, video_id);
    let bucket_name = matches.value_of("bucket_name").unwrap().to_string();

    ConcatArgs {
      preset: preset.to_owned(),
      work_dir: work_dir.to_owned(),
      video_id: video_id.to_owned(),
      manifest_path: format!("{}/manifest.txt", work_dir.clone(),),
      local_audio_path: format!("{}/source.wav", work_dir.clone()).to_owned(),
      local_segment_path: format!("{}/{}", work_dir.clone(), preset.clone())
        .to_owned(),
      remote_audio_path: format!(
        "s3://{}/audio/{}/source.wav",
        bucket_name.clone(),
        video_id.clone()
      )
      .to_owned(),
      remote_segment_path: format!(
        "s3://{}/segments/{}/{}",
        bucket_name.clone(),
        video_id.clone(),
        preset.clone()
      ),
      local_transcoded_no_audio_path: format!(
        "{}/{}-no-audio.mp4",
        work_dir.clone(),
        preset.clone()
      ),
      local_transcoded_with_audio_path: format!(
        "{}/{}.mp4",
        work_dir.clone(),
        preset.clone()
      ),
      remote_transcoded_path: format!(
        "s3://{}/transcoded/{}/{}.mp4",
        bucket_name.clone(),
        video_id.clone(),
        preset.clone()
      )
      .to_owned(),
      mode: matches.value_of("mode").unwrap().to_string().to_owned(),
    }
  }
}
