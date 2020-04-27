use clap;
use std::env;
// use uuid::Uuid;

pub struct SegArgs {
  pub mode: String,
  pub work_dir: String,
  pub video_id: String,
  pub filename: String,
  pub segment_path: String,
  pub remote_dest_path: String,
  pub source_video_path: String,
  pub remote_audio_path: String,
  pub source_audio_path: String,
  pub remote_source_path: String,
  pub transcode_queue_url: String,
  pub remote_segment_path: String,
}

impl SegArgs {
  pub fn new(matches: clap::ArgMatches) -> SegArgs {
    // TODO :: Should use uuid instead of video_id
    let cwd = env::current_dir().unwrap();
    let current_dir = &cwd.display();
    let video_id = matches.value_of("video_id").unwrap().to_string();
    let work_dir = format!("{}/tmp/{}", current_dir, video_id);
    let filename = matches.value_of("filename").unwrap().to_string();
    let bucket_name = matches.value_of("bucket_name").unwrap().to_string();
    
    SegArgs {
      work_dir: work_dir.clone(),
      video_id: video_id.clone(),
      filename: filename.clone(),
      mode: matches.value_of("mode").unwrap().to_string(),
      segment_path: format!("{}/segments", work_dir.clone()),
      source_audio_path: format!("{}/{}.wav", work_dir, filename.clone()),
      source_video_path: format!("{}/{}", work_dir.clone(), filename.clone()),
      transcode_queue_url: matches.value_of("transcode_queue_url").unwrap().to_string(),
      remote_dest_path: format!("s3://{}/segments/{}", bucket_name.clone(), video_id.clone()),
      remote_segment_path: format!("s3://{}/segments/{}/source", bucket_name.clone(), video_id.clone()),
      remote_audio_path: format!("s3://{}/audio/{}/source.wav", bucket_name.clone(), video_id.clone()),
      remote_source_path: format!("s3://{}/uploads/{}/{}", bucket_name.clone(), video_id.clone(), filename.clone()),
    }
  }
}