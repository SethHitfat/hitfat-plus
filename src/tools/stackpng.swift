// A stacked-alpha frame to its transparent poster (kusut.png and friends):
//   swiftc -O stackpng.swift -o stackpng && ./stackpng n_0.png img/mascot/anim/kusut.png
import AppKit
let a = CommandLine.arguments
let src = CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(URL(fileURLWithPath: a[1]) as CFURL, nil)!, 0, nil)!
let W = src.width, H = src.height/2
let c = CGContext(data: nil, width: W, height: 2*H, bitsPerComponent: 8, bytesPerRow: W*4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
c.draw(src, in: CGRect(x: 0, y: 0, width: W, height: 2*H))
let p = c.data!.assumingMemoryBound(to: UInt8.self)   // row 0 = top of image
var o = [UInt8](repeating: 0, count: W*H*4)
for y in 0..<H { for x in 0..<W { let t = (y*W+x)*4, m = ((y+H)*W+x)*4; let al = Int(p[m])
  for k in 0..<3 { o[t+k] = UInt8(Int(p[t+k]) * al / 255) }; o[t+3] = UInt8(al) } }   // premultiplied for CG
let oc = CGContext(data: &o, width: W, height: H, bitsPerComponent: 8, bytesPerRow: W*4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
let rep = NSBitmapImageRep(cgImage: oc.makeImage()!)
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
