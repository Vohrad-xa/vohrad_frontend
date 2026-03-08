import ExpoModulesCore
import SwiftUI

// MARK: - Gradient Style Type
internal enum GradientStyleType: String, Enumerable {
  case linearGradient
  case radialGradient
  case angularGradient
  case ellipticalGradient
  case meshGradient
}

// MARK: - Bridged Gradient Data Types
internal struct GradientStop: Record {
  @Field var color: Color = .clear
  @Field var location: CGFloat = 0
}

internal struct MeshPoint: Record {
  @Field var x: Float = 0
  @Field var y: Float = 0
}

// MARK: - Gradient Config
internal struct GradientConfig: Record {
  @Field var gradientType: GradientStyleType = .linearGradient
  @Field var colors: [Color]?
  @Field var stops: [GradientStop]?
  @Field var startPoint: UnitPoint?
  @Field var endPoint: UnitPoint?
  @Field var center: UnitPoint?
  @Field var startRadius: CGFloat?
  @Field var endRadius: CGFloat?
  @Field var startRadiusFraction: CGFloat?
  @Field var endRadiusFraction: CGFloat?
  @Field var startAngle: CGFloat?
  @Field var endAngle: CGFloat?
  @Field var width: Int?
  @Field var height: Int?
  @Field var points: [MeshPoint]?

  func resolve() -> AnyShapeStyle? {
    switch gradientType {
    case .linearGradient:
      guard let gradient = makeGradient(), let startPoint, let endPoint else { return nil }
      return AnyShapeStyle(LinearGradient(gradient: gradient, startPoint: startPoint, endPoint: endPoint))

    case .radialGradient:
      guard let gradient = makeGradient(), let center, let startRadius, let endRadius else { return nil }
      return AnyShapeStyle(RadialGradient(gradient: gradient, center: center, startRadius: startRadius, endRadius: endRadius))

    case .angularGradient:
      guard let gradient = makeGradient(), let center else { return nil }
      return AnyShapeStyle(AngularGradient(
        gradient: gradient,
        center: center,
        startAngle: .degrees(Double(startAngle ?? 0)),
        endAngle: .degrees(Double(endAngle ?? 360))
      ))

    case .ellipticalGradient:
      guard let gradient = makeGradient() else { return nil }
      return AnyShapeStyle(EllipticalGradient(
        gradient: gradient,
        center: center ?? .center,
        startRadiusFraction: startRadiusFraction ?? 0,
        endRadiusFraction: endRadiusFraction ?? 0.5
      ))

    case .meshGradient:
      if #available(iOS 18.0, *) {
        guard let width, let height, let points, let colors,
              points.count == width * height,
              colors.count == width * height else { return nil }
        let simdPoints = points.map { SIMD2<Float>($0.x, $0.y) }
        return AnyShapeStyle(MeshGradient(width: width, height: height, points: simdPoints, colors: colors))
      }
      return nil
    }
  }

  private func makeGradient() -> Gradient? {
    if let stops, !stops.isEmpty {
      return Gradient(stops: stops.map { Gradient.Stop(color: $0.color, location: $0.location) })
    }
    if let colors, !colors.isEmpty {
      return Gradient(colors: colors)
    }
    return nil
  }
}
