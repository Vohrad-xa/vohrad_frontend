import SwiftUI
import ExpoModulesCore

final class SectionProps: UIBaseViewProps {
  @Field var title: String?
  @Field var collapsible: Bool = false
  @Field var initiallyExpanded: Bool = true
}

internal final class SectionHeaderProps: ExpoSwiftUI.ViewProps {}
internal struct SectionHeader: ExpoSwiftUI.View {
  @ObservedObject var props: SectionHeaderProps

  var body: some View {
    Children()
  }
}

internal final class SectionFooterProps: ExpoSwiftUI.ViewProps {}
internal struct SectionFooter: ExpoSwiftUI.View {
  @ObservedObject var props: SectionFooterProps

  var body: some View {
    Children()
  }
}

internal final class SectionContentProps: ExpoSwiftUI.ViewProps {}
internal struct SectionContent: ExpoSwiftUI.View {
  @ObservedObject var props: SectionContentProps

  var body: some View {
    Children()
  }
}

internal struct SectionView: ExpoSwiftUI.View {
  @ObservedObject var props: SectionProps
  @State private var isExpanded: Bool = true

  var body: some View {
    if props.collapsible {
      collapsibleSection
    } else {
      regularSection
    }
  }

  @ViewBuilder
  private var contentChildren: some View {
    if let content = props.children?
      .compactMap({ $0.childView as? SectionContent })
      .first {
      content
    }
  }

  @ViewBuilder
  private var headerView: some View {
    if let header = props.children?
      .compactMap({ $0.childView as? SectionHeader })
      .first {
      header
    } else if let title = props.title, !title.isEmpty {
      Text(title).textCase(nil)
    }
  }

  @ViewBuilder
  private var footerView: some View {
    if let footer = props.children?
      .compactMap({ $0.childView as? SectionFooter })
      .first {
      footer
    }
  }

  @ViewBuilder
  private var regularSection: some View {
    Section {
      contentChildren
    } header: {
      headerView
    } footer: {
      footerView
    }
  }

  @ViewBuilder
  private var collapsibleSection: some View {
    Section {
      if isExpanded {
        contentChildren
      }
    } header: {
      SwiftUI.Button {
        withAnimation {
          isExpanded.toggle()
        }
      } label: {
        HStack {
          headerView
          Spacer()
          Image(systemName: "chevron.right")
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(Color.accentColor)
            .rotationEffect(.degrees(isExpanded ? 90 : 0))
            .animation(.default, value: isExpanded)
        }
        .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
    } footer: {
      if isExpanded {
        footerView
      }
    }
    .onAppear {
      isExpanded = props.initiallyExpanded
    }
  }
}