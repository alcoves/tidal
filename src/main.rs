use std::process::Command;

fn main() {
    println!("transcoding job starting...");

    let s3_in = "s3://tidal-bken/segments/test/source/0.mp4";
    let _s3_out = "s3://tidal-bken/segments/test/libx264-720p/0.mp4";
    let _ffmpeg_command = "-bf 2 -g 30 -crf 24 -coder 1 -preset faster -c:v libx264 -keyint_min 30 -profile:v high -pix_fmt yuv420p -vf fps=fps=30,scale=1280:-2";

    println!("creating signed source url");
    let output = Command::new("aws")
        .arg("s3")
        .arg("presign")
        .arg(s3_in)
        .output();
    println!("presigned url: {:?}", output.unwrap());

    println!("parsing variables");

    println!("video_id");
    println!("preset_name");
    println!("segment_name");

    println!("creating tmp file");

    println!("transcoding started");

    println!("moving transcode to s3");

    println!("updating tidal database");

    println!("checking if concatination is required");

    println!("dispatching concatination job");

    println!("transcoding completed");
}
