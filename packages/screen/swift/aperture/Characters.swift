import AppKit

class Characters {
  private let images = Images()
  private var buffer: UnsafeMutablePointer<UInt8>
  private var perRow: Int
  private var shouldDebug = false
  private var debugImg: CGImage? = nil
  private var debugDir = ""
  private var maxLuma = 0

  init(data: UnsafeMutablePointer<UInt8>, perRow: Int, maxLuma: Int, debug: Bool, debugDir: String?, debugImg: CGImage?) {
    self.maxLuma = maxLuma // higher == allow lighter
    self.shouldDebug = debug
    self.buffer = data
    self.perRow = perRow
    self.debugDir = debugDir ?? ""
    self.debugImg = debugImg
  }

  func find(id: Int, bounds: [Int]) -> [[Int]] {
    let start = DispatchTime.now()
    let imgX = bounds[0] * 2
    let imgY = bounds[1] * 2 + 23
    let imgW = bounds[2]
    let imgH = bounds[3]
    var foundChars = [[Int]]()
    var pixels: [PixelData]? = nil
    if debugImg != nil {
       pixels = [PixelData](repeating: PixelData(a: 255, r: 255, g: 255, b: 255), count: imgW * imgH)
    }
    var curChar = 0
    // we control the sticks for more speed
    var x = 0
    var y = 0
    let maxHeightCheck = imgH - imgH / 4
    while true {
//      self.shouldDebug = id == 1 && curChar == 2
      // loop through from ltr, then ttb
      if y == imgH - 1 {
        x += 1
        y = 0
      } else {
        y += 1
      }
      // if reached last pixel, break
      if x >= imgW || y >= imgH || (x == imgW - 1 && y == imgH - 1) {
        break
      }
      // dont start on pixels close to bottom
      if y > maxHeightCheck {
        x += 1
        y = 0
        continue
      }
      // loop logic
      let xO = x * 2 + imgX
      let yO = y * 2 + imgY
      let luma = buffer[yO * perRow + xO]
      let isBlack = luma < maxLuma ? true : false
      if shouldDebug && debugImg != nil {
        pixels![x + y * imgW] = PixelData(a: 255, r: luma, g: luma, b: luma)
      }
      if isBlack {
        if shouldDebug && debugImg != nil {
          debug("-- line \(id), char \(curChar) starts \(x, y)")
          let charImgIn = images.cropImage(debugImg!, box: CGRect(x: xO / 2, y: yO / 2 - 24, width: 50, height: 50))
          images.writeCGImage(image: charImgIn, to: "/tmp/screen/testinline-\(id)-char-\(curChar).png")
        }
        let cb = self.findCharacter(
          startX: xO,
          startY: imgY,
          maxHeight: imgH * 2
        )
        let tooSmall = cb[2] < 5 && cb[3] < 5
        let tooWide = cb[3] / cb[2] > 10
        let tooTall = cb[2] / cb[3] > 20
        if tooSmall || tooWide || tooTall {
          print("misfit \(cb)")
        } else {
          foundChars.append(cb)
          if shouldDebug && debugImg != nil {
            images.writeCGImage(image: images.cropImage(debugImg!, box: CGRect(x: cb[0] / 2, y: cb[1] / 2 - 24, width: cb[2] / 2, height: cb[3] / 2)), to: "/tmp/screen/testchar-\(id)-\(curChar).png")
          }
        }
        // after processing new char, move x to end of char
        x += cb[2] / 2
        y = 0
        curChar += 1
      }
    }
    if shouldDebug && debugImg != nil {
      if let img = images.imageFromArray(pixels: pixels!, width: imgW, height: imgH) {
        Images().writeCGImage(image: img, to: "/tmp/screen/testoutline-\(id).png", resolution: 72) // write img
      }
    }
    debug("Characters.find() \(foundChars.count): \(Double(DispatchTime.now().uptimeNanoseconds - start.uptimeNanoseconds) / 1_000_000)ms")
    return foundChars
  }

  func debug(_ str: String) {
    if shouldDebug {
      print(str)
    }
  }

  func findCharacter(startX: Int, startY: Int, maxHeight: Int) -> [Int] {
    var minY = startY + maxHeight
    var maxHeight = startY
    var maxX = startX
    var x = startX - 1
    var foundAt = Dictionary<Int, Bool>()
    var noPixelStreak = 0
    let strideAmt = maxHeight > 14 ? 2 : 1 // more precise on smaller lines
    let maxNoPixels = strideAmt
    let yColStride = stride(from: 0, to: maxHeight * 2, by: strideAmt)
    while noPixelStreak <= maxNoPixels {
      let firstLoop = x <= startX + 2
      x += 1
      noPixelStreak += 1
      for yOff in yColStride {
        let yP = yOff + startY
        let curPos = yP * perRow + x
        if buffer[curPos] < maxLuma {
          foundAt[curPos] = true
          // count it if the leftward pixels touch
          let hasNeighbor = firstLoop ||
            foundAt[yP * perRow + x - 1] // left one
            ?? foundAt[(yP - 1) * perRow + x - 1] // left up
            ?? foundAt[(yP + 1) * perRow + x - 1] // left down
            ?? foundAt[yP * perRow + x - 1] // left
            ?? false
          
          let hasConnection = hasNeighbor && yP + strideAmt >= maxHeight
          if firstLoop || hasConnection {
            noPixelStreak = 0
            maxX = x
            if yP < minY {
              minY = yP
            }
            if yP > maxHeight {
              maxHeight = yP
            }
          }
        }
      }
    }
//    if shouldDebug {
//      debug("broke streak")
//      for yOff in yColStride {
//        let yP = yOff + startY
//        let curPos = yP * perRow + x
//        let lastPos = yP * perRow + x - 1
//        debug("\(foundAt[lastPos] ?? false) | \(foundAt[curPos] ?? false)")
//      }
//    }
    return [
      startX,
      minY,
      maxX - startX + 2,
      maxHeight - startY - 24
    ]
  }

  public func charsToString(rects: [[Int]], debugID: Int) -> String {
    //    let start = DispatchTime.now()
    var output = ""
    let dbl = Float(28)
    for (index, rect) in rects.enumerated() {
      let minX = rect[0]
      let minY = rect[1]
      if rect[3] == 0 || rect[2] == 0 {
        debug("empty char")
        continue
      }
      let width = Float(rect[2])
      let height = Float(rect[3])
      // make square
      var scaleX = Float(1)
      var scaleY = Float(1)
      if width > dbl {
        scaleX = width / dbl
      } else if width < dbl {
        scaleX = 1 / (dbl / width)
      }
      if height > dbl {
        scaleY = height / dbl
      } else if height < dbl {
        scaleY = 1 / (dbl / height)
      }
      var pixels: [PixelData]? = nil
      if shouldDebug && debugID > -1 {
        pixels = [PixelData]()
      }
      for y in 0..<28 {
        for x in 0..<28 {
          let xS = Int(Float(x) * scaleX)
          let yS = Int(Float(y) * scaleY)
          let luma = buffer[(minY + yS) * perRow + minX + xS]
          let lumaVal = luma < 150 ? "0 " : "255 " // warning, doing any sort of string conversion here slows it down bigly
          output += lumaVal
          if shouldDebug && debugID > -1 {
            let brt = UInt8(luma < 150 ? 0 : 255)
            pixels!.append(PixelData(a: 255, r: brt, g: brt, b: brt))
          }
        }
      }
      output += "\n"
      if shouldDebug && debugID > -1 {
        let outFile = "\(debugDir)/x-line-\(debugID)-char-\(index).png"
        images.writeCGImage(image: images.imageFromArray(pixels: pixels!, width: 28, height: 28)!, to: outFile, resolution: 72) // write img
      }
    }
    //    print(".. char => string: \(rects.count) \(Double(DispatchTime.now().uptimeNanoseconds - start.uptimeNanoseconds) / 1_000_000)ms")
    return output
  }
}

