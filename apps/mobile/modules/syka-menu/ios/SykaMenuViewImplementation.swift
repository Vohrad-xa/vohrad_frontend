import UIKit

@available(iOS 14.0, *)
final class SykaMenuViewImplementation: UIButton, MenuPresentingView {
  var onPressAction: ((String) -> Void)?
  var onMenuOpen: (() -> Void)?
  var onMenuClose: (() -> Void)?

  private var internalActions: [UIMenuElement] = []
  private var internalTitle: String = ""
  private var internalThemeVariant: String?
  private var tapShield: UIControl?

  var actions: [NSDictionary]? {
    didSet {
      guard let actions else {
        return
      }
      internalActions.removeAll()
      actions.forEach { menuAction in
        let action = SykaMenuAction(details: menuAction)
          .createUIMenuElement { action in
            self.sendButtonAction(action)
          }
        internalActions.append(action)
      }
      setup()
    }
  }

  var title: String? {
    didSet {
      internalTitle = title ?? ""
      setup()
    }
  }

  var shouldOpenOnLongPress: Bool = false {
    didSet {
      setup()
    }
  }

  var themeVariant: String? {
    didSet {
      internalThemeVariant = themeVariant
      setup()
    }
  }

  var hitSlop: UIEdgeInsets = .zero

  override var intrinsicContentSize: CGSize {
    let size = contentSizeFromSubviews()
    if size != .zero {
      return size
    }
    return super.intrinsicContentSize
  }

  override func sizeThatFits(_ size: CGSize) -> CGSize {
    let measuredSize = contentSizeFromSubviews()
    if measuredSize != .zero {
      return measuredSize
    }
    return super.sizeThatFits(size)
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
    let interaction = UIContextMenuInteraction(delegate: self)
    addInteraction(interaction)
    setup()
  }

  @available(*, unavailable)
  required init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    configurationForMenuAtLocation location: CGPoint
  ) -> UIContextMenuConfiguration? {
    onMenuOpen?()
    return UIContextMenuConfiguration(identifier: nil, previewProvider: nil) { [weak self] _ in
      self?.menu
    }
  }

  override func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    willDisplayMenuFor configuration: UIContextMenuConfiguration,
    animator: UIContextMenuInteractionAnimating?
  ) {
    installTapShield()
  }

  override func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    willEndFor configuration: UIContextMenuConfiguration,
    animator: UIContextMenuInteractionAnimating?
  ) {
    removeTapShield()
    onMenuClose?()
  }

  private func setup() {
    let menu = UIMenu(title: internalTitle, identifier: nil, children: internalActions)

    if let internalThemeVariant {
      switch internalThemeVariant {
      case "dark":
        overrideUserInterfaceStyle = .dark
      case "light":
        overrideUserInterfaceStyle = .light
      default:
        overrideUserInterfaceStyle = .unspecified
      }
    }

    self.menu = menu
    showsMenuAsPrimaryAction = !shouldOpenOnLongPress
  }

  private func contentSizeFromSubviews() -> CGSize {
    layoutIfNeeded()
    var unionRect = CGRect.null
    for subview in subviews where !subview.isHidden {
      unionRect = unionRect.union(subview.frame)
    }
    if unionRect.isNull {
      return .zero
    }
    return CGSize(width: unionRect.width, height: unionRect.height)
  }

  override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
    if hitSlop == .zero || !isEnabled || isHidden {
      return super.point(inside: point, with: event)
    }

    let largerFrame = CGRect(
      x: bounds.origin.x - hitSlop.left,
      y: bounds.origin.y - hitSlop.top,
      width: bounds.size.width + hitSlop.left + hitSlop.right,
      height: bounds.size.height + hitSlop.top + hitSlop.bottom
    )

    return largerFrame.contains(point)
  }

  private func sendButtonAction(_ action: UIAction) {
    onPressAction?(action.identifier.rawValue)
  }

  private func installTapShield() {
    guard tapShield == nil, let window else {
      return
    }
    let shield = UIControl(frame: window.bounds)
    shield.backgroundColor = .clear
    shield.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    shield.addTarget(self, action: #selector(handleTapShield), for: .touchUpInside)
    window.addSubview(shield)
    window.bringSubviewToFront(shield)
    tapShield = shield
  }

  private func removeTapShield() {
    tapShield?.removeFromSuperview()
    tapShield = nil
  }

  @objc private func handleTapShield() {}

  deinit {
    removeTapShield()
  }
}
