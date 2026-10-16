// Program poster masks (16 Oct 2026): the athlete in a studio photo as a white alpha mask,
// for hpoCard in train2.js. A new plan: swiftc -O mask.swift -o mask && ./mask img/p/<id>.jpg img/p/mask/<id>.png 540
// then add the plan to HPO_OF in train2.js with its colour.
import Foundation
import AppKit
import Vision
import CoreImage
// mask in.jpg out.png width: the foreground (the athlete) as an alpha mask, white, at the given width
let a = CommandLine.arguments
let url = URL(fileURLWithPath: a[1]), out = URL(fileURLWithPath: a[2]), W = Int(a[3]) ?? 540
let src = CGImageSourceCreateImageAtIndex(CGImageSourceCreateWithURL(url as CFURL, nil)!, 0, nil)!
let ci = CIImage(cgImage: src)
let rq = VNGenerateForegroundInstanceMaskRequest()
let h = VNImageRequestHandler(ciImage: ci)
try! h.perform([rq])
guard let r = rq.results?.first else { print("no subject", a[1]); exit(1) }
let m = try! r.generateScaledMaskForImage(forInstances: r.allInstances, from: h)
var mask = CIImage(cvPixelBuffer: m)
let s = CGFloat(W) / mask.extent.width
mask = mask.transformed(by: CGAffineTransform(scaleX: s, y: s))
let Hh = Int((mask.extent.height).rounded())
let ctx = CIContext()
let gray = ctx.createCGImage(mask, from: CGRect(x: 0, y: 0, width: W, height: Hh), format: .L8, colorSpace: CGColorSpaceCreateDeviceGray())!
// white RGBA, alpha = mask
let c = CGContext(data: nil, width: W, height: Hh, bitsPerComponent: 8, bytesPerRow: W*4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
c.clip(to: CGRect(x: 0, y: 0, width: W, height: Hh), mask: gray)
c.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1)); c.fill(CGRect(x: 0, y: 0, width: W, height: Hh))
let rep = NSBitmapImageRep(cgImage: c.makeImage()!)
try! rep.representation(using: .png, properties: [:])!.write(to: out)
print(a[1].split(separator: "/").last!, W, Hh, src.width, src.height)
