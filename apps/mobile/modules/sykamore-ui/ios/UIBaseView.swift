import ExpoModulesCore
import SwiftUI

/**
 Base view for all SwiftUI views.
 */
public struct UIBaseView<Props: UIBaseViewProps, Content: ExpoSwiftUI.View<Props>>: ExpoSwiftUI.View {
  @ObservedObject public var props: Props

  public init(props: Props) {
    self.props = props
  }

  public var body: some View {
    Content(props: props)
      .applyAccessibilityIdentifier(props.testID)
      .applyModifiers(props.modifiers, appContext: props.appContext, globalEventDispatcher: props.globalEventDispatcher)
  }
}

/**
 Base view modifier.
 This is useful for View with AsyncFunctions that cannot use the builder.
 */
public struct UIBaseViewModifier<Props: UIBaseViewProps>: ViewModifier {
  @ObservedObject var props: Props
  var defaultFrameAlignment = Alignment.center

  public func body(content: Content) -> some View {
    content
      .applyAccessibilityIdentifier(props.testID)
      .applyModifiers(props.modifiers, appContext: props.appContext, globalEventDispatcher: props.globalEventDispatcher)
  }
}

/**
 Common UI Builder.
 This is similar to expo-modules-core's View builder but further supports common base view props and modifiers
 */
public func ExpoUIView<Content: ExpoSwiftUI.View>(
  _ contentType: Content.Type
) -> ExpoSwiftUI.ViewDefinition<Content.Props, UIBaseView<Content.Props, Content>> where Content.Props: UIBaseViewProps {
  let wrappedType = UIBaseView<Content.Props, Content>.self
  let contentName = String(describing: contentType)

  return View(wrappedType) {
    ViewName(contentName)
  }
}
