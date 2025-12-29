import UIKit

private struct MenuOptions {
  let singleSelection: Bool
  let destructive: Bool
  let displayInline: Bool
}

@available(iOS 13.0, *)
final class SykaMenuAction {
  var identifier: UIAction.Identifier?
  var title: String
  var subtitle: String?
  private var menuOptions: MenuOptions?
  var image: UIImage?
  var attributes: UIAction.Attributes = []
  var state: UIAction.State = .off
  var subactions: [SykaMenuAction] = []
  var preferredElementSizeString: String?

  init(details: NSDictionary) {
    if let identifier = details["id"] as? NSString {
      self.identifier = UIAction.Identifier(rawValue: identifier as String)
    }

    if let image = details["image"] as? NSString {
      self.image = UIImage(systemName: image as String) ?? UIImage(named: image as String)
      if let imageColor = details["imageColor"] {
        if let color = SykaMenuAction.uiColor(from: imageColor) {
          self.image = self.image?.withTintColor(color, renderingMode: .alwaysOriginal)
        }
      }
    }

    if let title = details["title"] as? NSString {
      self.title = title as String
    } else {
      self.title = ""
    }

    if let subtitle = details["subtitle"] as? NSString {
      self.subtitle = subtitle as String
    }

    if let menuOptions = details["menuOptions"] as? NSDictionary {
      let singleSelection = menuOptions["singleSelection"] as? Bool ?? false
      let destructive = menuOptions["destructive"] as? Bool ?? false
      let inline = menuOptions["displayInline"] as? Bool ?? false
      self.menuOptions = MenuOptions(
        singleSelection: singleSelection,
        destructive: destructive,
        displayInline: inline
      )
    }

    if let attributes = details["attributes"] as? NSDictionary {
      if (attributes["destructive"] as? Bool) == true {
        self.attributes.update(with: .destructive)
      }
      if (attributes["disabled"] as? Bool) == true {
        self.attributes.update(with: .disabled)
      }
      if (attributes["hidden"] as? Bool) == true {
        self.attributes.update(with: .hidden)
      }
      if (attributes["keepsMenuPresented"] as? Bool) == true {
        if #available(iOS 16.0, *) {
          self.attributes.update(with: .keepsMenuPresented)
        }
      }
    }

    if let state = details["state"] as? NSString {
      if state == "on" {
        self.state = .on
      } else if state == "off" {
        self.state = .off
      } else if state == "mixed" {
        self.state = .mixed
      }
    }

    if let subactions = details["subactions"] as? NSArray {
      if subactions.count > 0 {
        for subaction in subactions {
          guard let subaction = subaction as? NSDictionary else {
            continue
          }
          self.subactions.append(SykaMenuAction(details: subaction))
        }
      }
    }

    if let preferredElementSizeString = details["preferredElementSize"] as? String {
      self.preferredElementSizeString = preferredElementSizeString
    }
  }

  func createUIMenuElement(_ handler: @escaping UIActionHandler) -> UIMenuElement {
    if subactions.count > 0 {
      let subMenuActions = subactions.map { $0.createUIMenuElement(handler) }
      var options: UIMenu.Options = []
      if menuOptions?.displayInline == true {
        options.update(with: .displayInline)
      }
      if menuOptions?.destructive == true {
        options.update(with: .destructive)
      }
      if #available(iOS 15.0, *), menuOptions?.singleSelection == true {
        options.update(with: .singleSelection)
      }
      let menu = UIMenu(title: title, image: image, options: options, children: subMenuActions)

      if #available(iOS 16.0, *), let preferredElementSizeString {
        switch preferredElementSizeString {
        case "small":
          menu.preferredElementSize = .small
        case "medium":
          menu.preferredElementSize = .medium
        case "large":
          menu.preferredElementSize = .large
        default:
          break
        }
      }

      return menu
    }

    if #available(iOS 15.0, *) {
      return UIAction(
        title: title,
        subtitle: subtitle,
        image: image,
        identifier: identifier,
        attributes: attributes,
        state: state,
        handler: handler
      )
    }

    return UIAction(
      title: title,
      image: image,
      identifier: identifier,
      discoverabilityTitle: subtitle,
      attributes: attributes,
      state: state,
      handler: handler
    )
  }

  private static func uiColor(from value: Any?) -> UIColor? {
    guard let number = value as? NSNumber else {
      return nil
    }

    let argb = UInt32(bitPattern: number.int32Value)
    let alpha = CGFloat((argb >> 24) & 0xFF) / 255
    let red = CGFloat((argb >> 16) & 0xFF) / 255
    let green = CGFloat((argb >> 8) & 0xFF) / 255
    let blue = CGFloat(argb & 0xFF) / 255

    return UIColor(red: red, green: green, blue: blue, alpha: alpha)
  }
}
