// Orange "all messy" Bara (17 Oct 2026), rebuilt from the clean cream clip. The first orange
// recolour left grey-white patches (crest, ear tips, between the legs, eyebrows) and a dark
// matte fringe. Here every fur pixel goes through one luminance→orange ramp, the eyes and
// mouth (dark blobs, holes filled) keep their colour, the colour is bled past the edge so a
// soft alpha shows fur and not the black ground, and the mask is eroded 1px and feathered.
//   git show 386864a^:img/mascot/anim/kusut.mp4 > cream.mp4
//   swiftc -O kusut.swift -o kusut && ./kusut cream.mp4 img/mascot/anim/kusut.mp4 0
// The poster is frame 0 (written as n_0.png): ./stackpng n_0.png img/mascot/anim/kusut.png
import AVFoundation
import AppKit
let a = CommandLine.arguments
let oldURL = URL(fileURLWithPath: a[1]), outURL = URL(fileURLWithPath: a[2])
let dbg = Set(a.dropFirst(3).compactMap{Int($0)})
let W = 360, H = 360
func frames(_ u: URL) -> [[UInt8]] {
  let asset = AVURLAsset(url: u); let tr = asset.tracks(withMediaType: .video)[0]
  let r = try! AVAssetReader(asset: asset)
  let o = AVAssetReaderTrackOutput(track: tr, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
  r.add(o); r.startReading(); var out: [[UInt8]] = []
  while let sb = o.copyNextSampleBuffer() {
    let pb = CMSampleBufferGetImageBuffer(sb)!; CVPixelBufferLockBaseAddress(pb, .readOnly)
    let bpr = CVPixelBufferGetBytesPerRow(pb), base = CVPixelBufferGetBaseAddress(pb)!.assumingMemoryBound(to: UInt8.self)
    var f = [UInt8](repeating: 0, count: W*2*H*4 / 1 / 1)
    for y in 0..<(2*H) { for x in 0..<W { for c in 0..<4 { f[(y*W+x)*4+c] = base[y*bpr+x*4+c] } } }
    CVPixelBufferUnlockBaseAddress(pb, .readOnly); out.append(f)
  }
  return out
}
let old = frames(oldURL)
print("frames", old.count)
@inline(__always) func lum(_ b: Double,_ g: Double,_ r: Double) -> Double { 0.299*r + 0.587*g + 0.114*b }
var hist = [Double](repeating: 0, count: 256)
for fi in stride(from: 0, to: old.count, by: 8) { let o = old[fi]; for p in 0..<(W*H) where o[(p+W*H)*4+2] > 250 && p / W > 60 {
  let L = Int(lum(Double(o[p*4]), Double(o[p*4+1]), Double(o[p*4+2]))); if L > 120 { hist[L] += 1 } } }
var tot = hist.reduce(0,+), cum = 0.0, MED = 235.0; for i in 0..<256 { cum += hist[i]; if cum >= tot/2 { MED = Double(i); break } }
print("median fur L", MED)
let main: [Double] = [222, 92, 24]   // the orange fur at the cream clip's median
let anchors: [(Double,[Double])] = [(0,[24,8,2]),(70,[92,32,8]),(140,[170,68,18]),(195,[(main[0]+170)/2*1.02,(main[1]+68)/2*1.05,(main[2]+18)/2]),(235,main),(255,[246,128,50])]
var ramp = [[Double]](repeating: [0,0,0], count: 256)
for i in 0..<256 { let L = Double(i); var k = 0; while k < anchors.count-2 && L > anchors[k+1].0 { k += 1 }
  let (l0,c0) = anchors[k], (l1,c1) = anchors[k+1]; let t = max(0,min(1,(L-l0)/(l1-l0))); ramp[i] = (0..<3).map{ c0[$0]*(1-t)+c1[$0]*t } }
for i in stride(from: 0, to: 256, by: 32) { print(i, ramp[i].map{Int($0)}) }

func box(_ src: [Double], _ r: Int) -> [Double] {
  var t = src, o = src
  for y in 0..<H { for x in 0..<W { var s = 0.0, n = 0.0; for d in -r...r { let xx = x+d; if xx>=0 && xx<W { s += src[y*W+xx]; n += 1 } }; t[y*W+x] = s/n } }
  for y in 0..<H { for x in 0..<W { var s = 0.0, n = 0.0; for d in -r...r { let yy = y+d; if yy>=0 && yy<H { s += t[yy*W+x]; n += 1 } }; o[y*W+x] = s/n } }
  return o
}
func minf(_ src: [Double]) -> [Double] { var o = src
  for y in 0..<H { for x in 0..<W { var m = 1.0; for dy in -1...1 { for dx in -1...1 { let xx = min(W-1,max(0,x+dx)), yy = min(H-1,max(0,y+dy)); m = min(m, src[yy*W+xx]) } }; o[y*W+x] = m } }
  return o }
func maxf(_ src: [Double], _ r: Int) -> [Double] { var o = src
  for y in 0..<H { for x in 0..<W { var m = 0.0; for dy in -r...r { for dx in -r...r { let xx = min(W-1,max(0,x+dx)), yy = min(H-1,max(0,y+dy)); m = max(m, src[yy*W+xx]) } }; o[y*W+x] = m } }
  return o }

func keepBig(_ src: [Double], _ minA: Int) -> [Double] {
  var lab = [Int](repeating: 0, count: W*H), o = [Double](repeating: 0, count: W*H), id = 0
  for s0 in 0..<(W*H) where src[s0] > 0.5 && lab[s0] == 0 {
    id += 1; var st = [s0], comp: [Int] = []; lab[s0] = id
    while let p = st.popLast() { comp.append(p); let x = p % W, y = p / W
      for (dx,dy) in [(1,0),(-1,0),(0,1),(0,-1)] { let xx = x+dx, yy = y+dy; if xx<0||yy<0||xx>=W||yy>=H { continue }; let q = yy*W+xx; if src[q] > 0.5 && lab[q] == 0 { lab[q] = id; st.append(q) } } }
    if comp.count >= minA { for p in comp { o[p] = 1 } }
  }
  return o }
func fillHoles(_ src: [Double]) -> [Double] {
  var out = [Bool](repeating: false, count: W*H); var st: [Int] = []
  for x in 0..<W { st.append(x); st.append((H-1)*W+x) }; for y in 0..<H { st.append(y*W); st.append(y*W+W-1) }
  while let p = st.popLast() { if out[p] || src[p] > 0.5 { continue }; out[p] = true; let x = p % W, y = p / W
    for (dx,dy) in [(1,0),(-1,0),(0,1),(0,-1)] { let xx = x+dx, yy = y+dy; if xx<0||yy<0||xx>=W||yy>=H { continue }; st.append(yy*W+xx) } }
  return out.map{ $0 ? 0 : 1 } }
var outFrames: [[UInt8]] = []
for (fi, o) in old.enumerated() {
  var m = [Double](repeating: 0, count: W*H), prot = m
  var col = [[Double]](repeating: [0,0,0], count: W*H)
  for p in 0..<(W*H) {
    m[p] = Double(o[(p+W*H)*4+2]) / 255
    let b = Double(o[p*4]), g = Double(o[p*4+1]), r = Double(o[p*4+2])
    // straight (un-premultiplied) colour
    let mm = max(m[p], 0.05)
    let ub = min(255, b/mm), ug = min(255, g/mm), ur = min(255, r/mm)
    let mx = max(ur,ug,ub), mn = min(ur,ug,ub), sat = mx > 0 ? (mx-mn)/mx : 0, L = lum(ub,ug,ur)
    // eyes, pupils, mouth: saturated-dark or very dark (eyebrows are grey: recoloured)
    if m[p] > 0.6 && L < 60 && p / W < 250 { prot[p] = 1 }
    _ = sat
    let Lc = max(0, min(255, 235 + (L - MED) * 1.25))   // more fur contrast: the tangles read
    let rr = ramp[Int(Lc)]
    col[p] = [rr[2], rr[1], rr[0], ub, ug, ur]
  }
  prot = fillHoles(keepBig(maxf(prot, 3), 150))
  prot = minf(minf(minf(prot)))   // close: back to the dark outline, no cream ring
  prot = box(prot, 1)
  // mask: erode 1px, feather
  var nm = box(minf(m), 1)
  for p in 0..<(W*H) { nm[p] = min(nm[p], m[p]) }
  // colour: fur ramp or kept original, then bled outward from solid pixels
  var fin = [[Double]](repeating: [0,0,0], count: W*H); var solid = [Bool](repeating: false, count: W*H)
  for p in 0..<(W*H) { let k = prot[p]; fin[p] = (0..<3).map{ col[p][$0]*(1-k) + col[p][$0+3]*k }; solid[p] = m[p] > 0.92 }
  for _ in 0..<8 {
    var nf = fin, ns = solid
    for y in 0..<H { for x in 0..<W { let p = y*W+x; if solid[p] { continue }
      var s = [0.0,0,0], n = 0.0
      for dy in -1...1 { for dx in -1...1 { let xx = x+dx, yy = y+dy; if xx<0||yy<0||xx>=W||yy>=H { continue }; let q = yy*W+xx; if solid[q] { for c in 0..<3 { s[c] += fin[q][c] }; n += 1 } } }
      if n > 0 { nf[p] = s.map{$0/n}; ns[p] = true } } }
    fin = nf; solid = ns
  }
  var f = [UInt8](repeating: 255, count: W*2*H*4)
  for p in 0..<(W*H) {
    let a = nm[p] < 0.03 ? 0 : nm[p]
    for c in 0..<3 { f[p*4+c] = a == 0 ? 0 : UInt8(max(0,min(255, fin[p][c]))) }
    let mv = UInt8(max(0,min(255, a*255))); f[(p+W*H)*4] = mv; f[(p+W*H)*4+1] = mv; f[(p+W*H)*4+2] = mv
  }
  outFrames.append(f)
  if dbg.contains(fi) {
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: W, pixelsHigh: 2*H, bitsPerSample: 8, samplesPerPixel: 3, hasAlpha: false, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: W*3, bitsPerPixel: 24)!
    let d = rep.bitmapData!; for p in 0..<(W*2*H) { d[p*3] = f[p*4+2]; d[p*3+1] = f[p*4+1]; d[p*3+2] = f[p*4] }
    try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: "n_\(fi).png"))
  }
}
// encode
try? FileManager.default.removeItem(at: outURL)
let w = try! AVAssetWriter(outputURL: outURL, fileType: .mp4)
let inp = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: 2*H,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 1_700_000, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel, AVVideoMaxKeyFrameIntervalKey: 24, AVVideoAllowFrameReorderingKey: false]])
inp.expectsMediaDataInRealTime = false
let ad = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: inp, sourcePixelBufferAttributes: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: 2*H])
w.add(inp); w.startWriting(); w.startSession(atSourceTime: .zero)
for (i, f) in outFrames.enumerated() {
  while !inp.isReadyForMoreMediaData { usleep(2000) }
  var pb: CVPixelBuffer?; CVPixelBufferPoolCreatePixelBuffer(nil, ad.pixelBufferPool!, &pb)
  CVPixelBufferLockBaseAddress(pb!, []); let bpr = CVPixelBufferGetBytesPerRow(pb!); let base = CVPixelBufferGetBaseAddress(pb!)!.assumingMemoryBound(to: UInt8.self)
  for y in 0..<(2*H) { for x in 0..<W { for c in 0..<4 { base[y*bpr+x*4+c] = f[(y*W+x)*4+c] } } }
  CVPixelBufferUnlockBaseAddress(pb!, [])
  ad.append(pb!, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: 24))
}
inp.markAsFinished(); let sem = DispatchSemaphore(value: 0); w.finishWriting { sem.signal() }; sem.wait()
print("wrote", outURL.path, w.status.rawValue, w.error as Any)
