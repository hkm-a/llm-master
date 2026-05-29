import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VideoPlayer } from "./VideoPlayer";

// Mock HTMLVideoElement
const mockVideo = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
  duration: 100,
  paused: true,
};

HTMLVideoElement.prototype.play = mockVideo.play;
HTMLVideoElement.prototype.pause = mockVideo.pause;

describe("VideoPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVideo.paused = true;
    mockVideo.currentTime = 0;
  });

  it("renders the video element", () => {
    render(<VideoPlayer src="/videos/test.mp4" />);
    const video = document.querySelector("video");
    expect(video).toBeInTheDocument();
  });

  it("renders the video source", () => {
    render(<VideoPlayer src="/videos/test.mp4" />);
    const video = document.querySelector("video");
    expect(video).toHaveAttribute("src", "/videos/test.mp4");
  });

  it("renders the play button", () => {
    render(<VideoPlayer src="/videos/test.mp4" />);
    expect(screen.getByLabelText("播放")).toBeInTheDocument();
  });

  it("renders the restart button", () => {
    render(<VideoPlayer src="/videos/test.mp4" />);
    expect(screen.getByLabelText("重新播放")).toBeInTheDocument();
  });

  it("renders the caption when provided", () => {
    render(<VideoPlayer src="/videos/test.mp4" caption="Test Caption" />);
    expect(screen.getByText("Test Caption")).toBeInTheDocument();
  });

  it("renders the seek bar", () => {
    render(<VideoPlayer src="/videos/test.mp4" />);
    expect(screen.getByLabelText("播放进度")).toBeInTheDocument();
  });

  it("renders without caption when not provided", () => {
    render(<VideoPlayer src="/videos/test.mp4" />);
    expect(screen.queryByText(/Caption/)).not.toBeInTheDocument();
  });

  it("toggles play/pause on button click", () => {
    render(<VideoPlayer src="/videos/test.mp4" />);
    const playButton = screen.getByLabelText("播放");
    fireEvent.click(playButton);
    expect(mockVideo.play).toHaveBeenCalled();
  });

  it("handles restart button click", () => {
    render(<VideoPlayer src="/videos/test.mp4" />);
    const restartButton = screen.getByLabelText("重新播放");
    fireEvent.click(restartButton);
    expect(mockVideo.play).toHaveBeenCalled();
  });

  it("handles seek bar click", () => {
    render(<VideoPlayer src="/videos/test.mp4" />);
    const seekBar = screen.getByLabelText("播放进度");
    fireEvent.click(seekBar, { clientX: 100 });
  });

  it("handles keyboard navigation on seek bar", () => {
    render(<VideoPlayer src="/videos/test.mp4" />);
    const seekBar = screen.getByLabelText("播放进度");
    fireEvent.keyDown(seekBar, { key: "ArrowRight" });
    fireEvent.keyDown(seekBar, { key: "ArrowLeft" });
  });

  it("renders with poster", () => {
    render(<VideoPlayer src="/videos/test.mp4" poster="/poster.jpg" />);
    const video = document.querySelector("video");
    expect(video).toHaveAttribute("poster", "/poster.jpg");
  });
});
