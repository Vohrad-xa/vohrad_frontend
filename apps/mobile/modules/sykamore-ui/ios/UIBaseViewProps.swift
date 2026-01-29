import ExpoModulesCore
import SwiftUI

internal typealias ModifierType = [String: Any]
internal typealias ModifierArray = [ModifierType]

/** Base view props with modifier support */
public class UIBaseViewProps: ExpoSwiftUI.ViewProps {
  @Field var testID: String?
  @Field var modifiers: ModifierArray?
}
