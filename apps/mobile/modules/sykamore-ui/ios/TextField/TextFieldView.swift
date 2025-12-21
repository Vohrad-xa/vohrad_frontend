import SwiftUI
import ExpoModulesCore


enum KeyboardType: String, Enumerable {
  case defaultKeyboard = "default"
  case emailAddress = "email-address"
  case numeric = "numeric"
  case phonePad = "phone-pad"
  case asciiCapable = "ascii-capable"
  case numbersAndPunctuation = "numbers-and-punctuation"
  case url = "url"
  case namePhonePad = "name-phone-pad"
  case decimalPad = "decimal-pad"
  case twitter = "twitter"
  case webSearch = "web-search"
  case asciiCapableNumberPad = "ascii-capable-number-pad"
}

enum TextContentType: String, Enumerable {
  case emailAddress = "email-address"
  case password = "password"
  case newPassword = "new-password"
  case oneTimeCode = "one-time-code"
  case username = "username"
  case name = "name"
  case givenName = "given-name"
  case familyName = "family-name"
  case telephoneNumber = "telephone-number"
  case addressCity = "address-city"
  case addressState = "address-state"
  case postalCode = "postal-code"
  case streetAddressLine1 = "street-address-line1"
  case streetAddressLine2 = "street-address-line2"
  case creditCardNumber = "credit-card-number"

  func toUITextContentType() -> UITextContentType? {
    switch self {
    case .emailAddress: return .emailAddress
    case .password: return .password
    case .newPassword: return .newPassword
    case .oneTimeCode: return .oneTimeCode
    case .username: return .username
    case .name: return .name
    case .givenName: return .givenName
    case .familyName: return .familyName
    case .telephoneNumber: return .telephoneNumber
    case .addressCity: return .addressCity
    case .addressState: return .addressState
    case .postalCode: return .postalCode
    case .streetAddressLine1: return .streetAddressLine1
    case .streetAddressLine2: return .streetAddressLine2
    case .creditCardNumber: return .creditCardNumber
    }
  }
}



enum TextInputAutocapitalization: String, Enumerable {
  case never = "never"
  case words = "words"
  case sentences = "sentences"
  case characters = "characters"

  @available(iOS 15.0, *)
  func toSwiftUI() -> SwiftUI.TextInputAutocapitalization {
    switch self {
    case .never: return .never
    case .words: return .words
    case .sentences: return .sentences
    case .characters: return .characters
    }
  }
}

enum TextFieldStyleType: String, Enumerable {
  case automatic = "automatic"
  case plain = "plain"
  case roundedBorder = "rounded-border"
}

struct AutocapitalizationModifier: ViewModifier {
  var autocapitalization: TextInputAutocapitalization?

  @ViewBuilder
  func body(content: Content) -> some View {
    if let autocap = autocapitalization {
      if #available(iOS 15.0, *) {
        content.textInputAutocapitalization(autocap.toSwiftUI())
      } else {
        content
      }
    } else {
      content
    }
  }
}

final class TextFieldProps: UIBaseViewProps {
  @Field var defaultValue: String = ""
  @Field var placeholder: String = ""
  @Field var multiline: Bool = false
  @Field var numberOfLines: Int?
  @Field var keyboardType: KeyboardType = KeyboardType.defaultKeyboard
  @Field var autocorrection: Bool = true
  @Field var allowNewlines: Bool = true
  @Field var autoFocus: Bool = false
  @Field var isSecure: Bool = false
  @Field var textContentType: TextContentType?
  @Field var submitLabel: SubmitLabel?
  @Field var autocapitalization: TextInputAutocapitalization?
  @Field var textFieldStyle: TextFieldStyleType = .automatic
  var onChangeText = EventDispatcher()
  var onChangeFocus = EventDispatcher()
  var onChangeSelection = EventDispatcher()
  var onSubmit = EventDispatcher()
}

func getKeyboardType(_ keyboardType: KeyboardType?) -> UIKeyboardType {
  guard let keyboardType = keyboardType else {
    return .default
  }
  switch keyboardType {
  case .defaultKeyboard:
    return .default
  case .emailAddress:
    return .emailAddress
  case .numeric:
    return .numberPad
  case .phonePad:
    return .phonePad
  case .asciiCapable:
    return .asciiCapable
  case .numbersAndPunctuation:
    return .numbersAndPunctuation
  case .url:
    return .URL
  case .namePhonePad:
    return .namePhonePad
  case .decimalPad:
    return .decimalPad
  case .twitter:
    return .twitter
  case .webSearch:
    return .webSearch
  case .asciiCapableNumberPad:
    return .asciiCapableNumberPad
  }
}

class TextFieldManager: ObservableObject {
  @Published var text: String
  @Published var isFocused: Bool

  #if !os(tvOS)
  @Published var _selection: Any?
  @available(iOS 18.0, macOS 15.0, *)
  var selection: SwiftUI.TextSelection? {
    get { _selection as? SwiftUI.TextSelection }
    set { _selection = newValue }
  }
  #endif

  init(initialText: String = "") {
    self.text = initialText
    self.isFocused = false
  }
}

func allowMultiLine() -> Bool {
  #if os(tvOS)
  return false
  #else
  return true
  #endif
}

struct TextFieldView: ExpoSwiftUI.View, ExpoSwiftUI.FocusableView {
  @ObservedObject var props: TextFieldProps
  @ObservedObject var textManager: TextFieldManager = TextFieldManager()
  @FocusState private var isFocused: Bool

  init(props: TextFieldProps) {
    self.props = props
  }

  func setText(_ text: String) {
    textManager.text = text
  }

  func focus() {
    textManager.isFocused = true
  }

  func blur() {
    textManager.isFocused = false
  }

  
  func forceResignFirstResponder() {
    if textManager.isFocused {
      UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
    
    textManager.isFocused = false
    isFocused = false
  }

  func setSelection(start: Int, end: Int) {
    #if !os(tvOS)
    if #available(iOS 18.0, macOS 15.0, *) {
      let lowerBound = min(start, end)
      let upperBound = max(start, end)
      let startIndex = textManager.text.index(textManager.text.startIndex, offsetBy: min(lowerBound, textManager.text.count))
      let endIndex = textManager.text.index(textManager.text.startIndex, offsetBy: min(upperBound, textManager.text.count))
      textManager.selection = SwiftUI.TextSelection(range: startIndex..<endIndex)
    }
    #endif
  }

  var text: some View {
    let baseField = Group {
      if props.isSecure {
        // SecureField doesn't support multiline or selection
        SecureField(props.placeholder, text: $textManager.text)
      } else if #available(iOS 18.0, macOS 15.0, tvOS 18.0, *) {
        #if !os(tvOS)
        TextField(
          props.placeholder,
          text: $textManager.text,
          selection: $textManager.selection,
          axis: (props.multiline && allowMultiLine()) ? .vertical : .horizontal
        )
        #else
        TextField(
          props.placeholder,
          text: $textManager.text,
          axis: (props.multiline && allowMultiLine()) ? .vertical : .horizontal
        )
        #endif
      } else if #available(iOS 16.0, tvOS 16.0, *) {
        TextField(
          props.placeholder,
          text: $textManager.text,
          axis: (props.multiline && allowMultiLine()) ? .vertical : .horizontal
        )
      } else {
        TextField(
          props.placeholder,
          text: $textManager.text
        )
      }
    }

    return baseField
      .lineLimit((props.multiline && allowMultiLine() && !props.isSecure) ? props.numberOfLines : 1)
      .modifier(UIBaseViewModifier(props: props))
      .fixedSize(horizontal: false, vertical: true)
      .keyboardType(getKeyboardType(props.keyboardType))
      .autocorrectionDisabled(!props.autocorrection)
      .if(props.textContentType != nil) { view in
        view.textContentType(props.textContentType?.toUITextContentType())
      }
      .if(props.submitLabel != nil) { view in
        view.submitLabel(props.submitLabel!.toSwiftUI())
      }
      .modifier(AutocapitalizationModifier(autocapitalization: props.autocapitalization))
      .if(props.textFieldStyle == .roundedBorder) { view in
        view.textFieldStyle(.roundedBorder)
      }
      .if(props.textFieldStyle == .plain) { view in
        view.textFieldStyle(.plain)
      }
      .focused($isFocused)
      .onSubmit({
        if props.allowNewlines && props.multiline && allowMultiLine() && !props.isSecure {
          if textManager.text.filter({ $0 == "\n" }).count < props.numberOfLines ?? Int.max - 1 {
            textManager.text.append("\n")

            // when selection state is set, the cursor does not auto update to added newline
            #if !os(tvOS)
            if #available(iOS 18.0, macOS 15.0, *) {
              let cursorPosition = textManager.text.endIndex
              textManager.selection = SwiftUI.TextSelection(range: cursorPosition..<cursorPosition)
            }
            #endif
          }
          isFocused = true
        }
        props.onSubmit(["value": textManager.text])
      })
  }

  var body: some View {
    let baseView = text
      .onAppear {
        textManager.text = props.defaultValue
        if props.autoFocus {
          isFocused = true
        }
      }
      .onChange(of: textManager.text) { newValue in
        props.onChangeText(["value": newValue])
      }
      .onChange(of: textManager.isFocused) { newValue in
        isFocused = newValue
      }
      .onChange(of: isFocused) { newValue in
        textManager.isFocused = newValue
        props.onChangeFocus(["value": newValue])
      }

    #if !os(tvOS)
    if #available(iOS 18.0, macOS 15.0, *) {
      return baseView.onChange(of: textManager.selection) {
        if let selection = textManager.selection {
          if case let .selection(range) = selection.indices {
            let clampedLower = range.lowerBound < textManager.text.endIndex ? range.lowerBound : textManager.text.endIndex
            let clampedUpper = range.upperBound < textManager.text.endIndex ? range.upperBound : textManager.text.endIndex

            let start = textManager.text.distance(from: textManager.text.startIndex, to: clampedLower)
            let end = textManager.text.distance(from: textManager.text.startIndex, to: clampedUpper)
            props.onChangeSelection(["start": start, "end": end])
          }
        }
      }
    } else {
      return baseView
    }
    #else
    return baseView
    #endif
  }
}
