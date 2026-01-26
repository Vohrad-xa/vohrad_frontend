package expo.modules.sykamoreui

import android.content.Context
import android.graphics.Color
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color as ComposeColor
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.AutoSizingComposable
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView
import expo.modules.kotlin.views.ComposableScope
import java.io.Serializable

open class ValueChangeEvent(
  @Field open val value: Boolean = false
) : Record, Serializable

class SwitchColors : Record {
  @Field
  val checkedThumbColor: Color? = null

  @Field
  val checkedTrackColor: Color? = null

  @Field
  val uncheckedThumbColor: Color? = null

  @Field
  val uncheckedTrackColor: Color? = null

  @Field
  val checkedColor: Color? = null

  @Field
  val disabledCheckedColor: Color? = null

  @Field
  val uncheckedColor: Color? = null

  @Field
  val disabledUncheckedColor: Color? = null

  @Field
  val checkmarkColor: Color? = null

  @Field
  val disabledIndeterminateColor: Color? = null
}

data class SwitchProps(
  val value: MutableState<Boolean> = mutableStateOf(false),
  val variant: MutableState<String> = mutableStateOf("switch"),
  val elementColors: MutableState<SwitchColors> = mutableStateOf(SwitchColors()),
  val modifiers: MutableState<List<ExpoModifier>> = mutableStateOf(emptyList()),
  val scale: MutableState<Float?> = mutableStateOf(null)
) : ComposeProps

@Composable
fun SwitchComposable(
  checked: Boolean,
  onCheckedChange: ((Boolean) -> Unit)?,
  colors: SwitchColors,
  modifier: Modifier = Modifier,
  tintColor: ComposeColor? = null
) {
  val defaultColors = SwitchDefaults.colors()
  Switch(
    checked = checked,
    onCheckedChange = onCheckedChange,
    modifier = modifier,
    colors = SwitchDefaults.colors(
      // For some reason the default way of passing colors using `compose` results in a transparent view
      checkedThumbColor = colors.checkedThumbColor.composeOrNull
        ?: tintColor
        ?: defaultColors.checkedThumbColor,
      checkedTrackColor = colors.checkedTrackColor.composeOrNull
        ?: tintColor
        ?: defaultColors.checkedTrackColor,
      uncheckedThumbColor = colors.uncheckedThumbColor.composeOrNull
        ?: defaultColors.uncheckedThumbColor,
      uncheckedTrackColor = colors.uncheckedTrackColor.composeOrNull
        ?: defaultColors.uncheckedTrackColor
    )
  )
}

@Composable
fun CheckboxComposable(
  checked: Boolean,
  onCheckedChange: ((Boolean) -> Unit)?,
  colors: SwitchColors,
  modifier: Modifier,
  tintColor: ComposeColor? = null
) {
  val checkedColor = colors.checkedColor.composeOrNull
    ?: tintColor
    ?: colors.checkedColor.compose
  Checkbox(
    checked = checked,
    onCheckedChange = onCheckedChange,
    modifier = modifier,
    colors = CheckboxDefaults.colors(
      checkedColor = checkedColor,
      disabledCheckedColor = colors.disabledCheckedColor.compose,
      uncheckedColor = colors.uncheckedColor.compose,
      disabledUncheckedColor = colors.disabledUncheckedColor.compose,
      checkmarkColor = colors.checkmarkColor.compose,
      disabledIndeterminateColor = colors.disabledIndeterminateColor.compose
    )
  )
}

@Composable
fun ThemedHybridSwitch(
  variant: String,
  checked: Boolean,
  onCheckedChange: ((Boolean) -> Unit)?,
  colors: SwitchColors,
  modifier: Modifier = Modifier,
  tintColor: ComposeColor? = null
) {
  DynamicTheme {
    when (variant) {
      "switch" -> SwitchComposable(checked, onCheckedChange, colors, modifier, tintColor)
      else -> CheckboxComposable(checked, onCheckedChange, colors, modifier, tintColor)
    }
  }
}

class SwitchView(context: Context, appContext: AppContext) :
  ExpoComposeView<SwitchProps>(context, appContext, withHostingView = true) {
  override val props = SwitchProps()
  private val onValueChange by EventDispatcher<ValueChangeEvent>()

  @Composable
  override fun ComposableScope.Content() {
    val (checked) = props.value
    val (variant) = props.variant
    val (colors) = props.elementColors
    val (scaleFactor) = props.scale
    val playSound = rememberClickSound()
    val onCheckedChange = { checked: Boolean ->
      playSound()
      onValueChange(ValueChangeEvent(checked))
    }
    val composedModifier = Modifier.fromExpoModifiers(props.modifiers.value)
    val tintColor = composedModifier.extractDialogStyleColors().tintColor
    val scaledModifier = scaleFactor?.let { composedModifier.scale(it) } ?: composedModifier

    AutoSizingComposable(shadowNodeProxy) {
      ThemedHybridSwitch(variant, checked, onCheckedChange, colors, scaledModifier, tintColor)
    }
  }
}
