import SwiftUI
import ExpoModulesCore

internal final class SectionHeaderProps: ExpoSwiftUI.ViewProps {}

internal final class SectionFooterProps: ExpoSwiftUI.ViewProps {}

internal final class SectionContentProps: ExpoSwiftUI.ViewProps {}

internal struct SectionHeader: ExpoSwiftUI.View {
  @ObservedObject var props: SectionHeaderProps

  var body: some View {
    Children()
  }
}

internal struct SectionFooter: ExpoSwiftUI.View {
  @ObservedObject var props: SectionFooterProps

  var body: some View {
    Children()
  }
}

internal struct SectionContent: ExpoSwiftUI.View {
  @ObservedObject var props: SectionContentProps

  var body: some View {
    Children()
  }
}