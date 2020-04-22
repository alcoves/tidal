use std::process::Command;

pub fn get_dimensions(path: String) -> Vec<u16> {
    println!("Getting video dimensions");

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

    println!(
        "Video is {}x{}",
        dimensions_u16_vec[0], dimensions_u16_vec[1]
    );
    return dimensions_u16_vec;
}
