use std::env;
use std::fs;
use std::process::Command;

fn get_dimensions(path: &str) -> Vec<u16> {
  let output = Command::new("ffprobe")
    .arg("-v")
    .arg("error")
    .arg("-of")
    .arg("csv=p=0:s=x")
    .arg("-show_entries")
    .arg("stream=width,height")
    .arg(path)
    .output()
    .unwrap();

  let stdout = String::from_utf8_lossy(&output.stdout);
  println!("ffprobe succeeded and stdout was: {}", stdout);

  let dimensions_str_vec: Vec<&str> = stdout.trim().split("x").collect();
  let mut dimensions_u16_vec: Vec<u16> = vec![];

  println!("dimensions: {:?}", dimensions_str_vec);

  for s in dimensions_str_vec {
    dimensions_u16_vec.push(s.parse::<u16>().unwrap())
  }

  println!("dimensions: {:?}", dimensions_u16_vec);
  return dimensions_u16_vec;
}

fn get_presets(width: u16, height: u16) {
  let presets: serde_json::Value = serde_json::from_str(the_file).expect("JSON was not well-formatted");
}

fn mkdirp(path: &str) -> std::io::Result<()> {
  fs::create_dir_all(path)?;
  Ok(())
}

pub fn run() {
  let args: Vec<String> = env::args().collect();

  let path = "./tmp/test.mp4";

  // assume invoked by lambda with ecsRunTask()
  // Parse env vars
  // CMD = tidal segment --src="./test.mp4" --destination="./segments/123"

  // Download video to tmp folder

  println!("Making segment directory");
  let _mk_dir_out = mkdirp("./tmp.segments");

  println!("Segmenting video with ffmpeg");
  let _ffmpeg_seg = Command::new("ffmpeg")
    .arg("-y")
    .arg("-i")
    .arg("./tmp/test.mp4")
    .arg("-c")
    .arg("copy")
    .arg("-f")
    .arg("segment")
    .arg("-segment_time")
    .arg("1")
    .arg("-an")
    .arg("./tmp/segments/output_%04d.mp4")
    .output();

  println!("Separating audio");
  // ffmpeg -y -i ./tmp/test.mp4 ./tmp/test.wav
  let _ffmpeg_audio = Command::new("ffmpeg")
    .arg("-y")
    .arg("-i")
    .arg("./tmp/test.mp4")
    .arg("./tmp/test.wav")
    .output();

  println!("Getting video dimensions");
  let dimensions = get_dimensions(path);
  println!("Video is {}x{}", dimensions[0], dimensions[1]);

  println!("Getting video presets");
  let presets = get_presets(dimensions);
  println!("Video presets: {:?}", presets)

  // println!("Creating thumbnail");

  println!("Creating message batch");

  println!("Sending message batch");

  println!("Enqueueing concatination request");
}
