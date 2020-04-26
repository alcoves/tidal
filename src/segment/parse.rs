use clap;
use std::env;
// use uuid::Uuid;

pub struct SegArgs {
  pub mode: String,
  pub work_dir: String,
  pub video_id: String,
  pub filename: String,
  pub source_path: String,
  pub segment_path: String,
  pub remote_dest_path: String,
  pub source_audio_path: String,
  pub remote_source_path: String,
}

impl SegArgs {
  pub fn new(matches: clap::ArgMatches) -> SegArgs {
    // let guid = Uuid::new_v4();
    let cwd = env::current_dir().unwrap();

    let guid = "test".to_string();
    let current_dir = &cwd.display();
    let work_dir = format!("{}/tmp/{}", current_dir, guid);

    let video_id = "123".to_string();
    let filename = "test".to_string();
    let video_ext = "mp4".to_string();

    SegArgs {
      work_dir: work_dir.clone(),
      video_id: video_id,
      filename: format!("{}.{}", filename, video_ext),
      segment_path: format!("{}/segments", work_dir.clone()),
      source_path: format!("{}/{}.{}", work_dir.clone(), filename, video_ext),
      source_audio_path: format!("{}/{}.wav", work_dir, filename),
      mode: matches.value_of("mode").unwrap().to_string(),
      remote_dest_path: matches.value_of("out").unwrap().to_string(),
      remote_source_path: matches.value_of("in").unwrap().to_string(),
    }
  }
}