package expo.modules.sykamoreui

import android.annotation.SuppressLint
import android.content.Context
import android.text.format.DateFormat
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DatePickerDefaults
import androidx.compose.material3.DisplayMode
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TimeInput
import androidx.compose.material3.TimePicker
import androidx.compose.material3.TimePickerDialog
import androidx.compose.material3.TimePickerDialogDefaults
import androidx.compose.material3.TimePickerDisplayMode
import androidx.compose.material3.TimePickerDefaults
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ComposableScope
import expo.modules.kotlin.views.ExpoComposeView
import kotlinx.coroutines.flow.distinctUntilChanged
import java.util.Calendar
import java.util.Date

@Composable
private fun DialogActionButton(label: String, onClick: () -> Unit) {
  StyledButton(
    variant = ButtonVariant.BORDERLESS,
    colors = ButtonColors(),
    disabled = false,
    onPress = onClick
  ) {
    Text(label)
  }
}

data class DatePickerResult(
  @Field
  val date: Long?
) : Record

data class DatePickerProps(
  val initialDate: MutableState<Long?> = mutableStateOf(null),
  val confirmText: MutableState<String> = mutableStateOf("OK"),
  val dismissText: MutableState<String> = mutableStateOf("Cancel"),
  val mode: MutableState<String> = mutableStateOf("date"),
  val variant: MutableState<String> = mutableStateOf("picker"),
  val showVariantToggle: MutableState<Boolean> = mutableStateOf(true),
  val timeTitle: MutableState<String?> = mutableStateOf(null),
  val is24Hour: MutableState<Boolean?> = mutableStateOf(null),
  val modifiers: MutableState<List<ExpoModifier>> = mutableStateOf(emptyList())
) : ComposeProps

@SuppressLint("ViewConstructor")
@OptIn(ExperimentalMaterial3Api::class)
class DatePickerView(context: Context, appContext: AppContext) :
  ExpoComposeView<DatePickerProps>(context, appContext, withHostingView = true) {
  override val props = DatePickerProps()
  private val onDateSelected by EventDispatcher<DatePickerResult>()
  private val onDismiss by EventDispatcher()

  @Composable
  override fun ComposableScope.Content() {
    var showDialog by remember { mutableStateOf(true) }
    val datePickerState = rememberDatePickerState(
      initialSelectedDateMillis = props.initialDate.value ?: Date().time,
      initialDisplayMode = if (props.variant.value == "input") {
        DisplayMode.Input
      } else {
        DisplayMode.Picker
      }
    )
    val mode = props.mode.value
    val context = LocalContext.current
    val confirmText = props.confirmText.value
    val dismissText = props.dismissText.value
    val composedModifier = Modifier.fromExpoModifiers(props.modifiers.value)
    val dialogStyle = composedModifier.extractDialogStyleColors()
    val tintColor = dialogStyle.tintColor
    val dialogBackgroundColor = dialogStyle.dialogBackgroundColor
    val playSound = rememberClickSound()

    LaunchedEffect(showDialog) {
      if (!showDialog) {
        onDismiss(emptyMap<String, Any>())
      }
    }

    if (showDialog) {
      DynamicTheme {
        if (mode == "time") {
          val baseTime = props.initialDate.value ?: Date().time
          val calendar = remember(baseTime) {
            Calendar.getInstance().apply { timeInMillis = baseTime }
          }
          val is24Hour = props.is24Hour.value ?: DateFormat.is24HourFormat(context)
          val timePickerState = rememberTimePickerState(
            initialHour = calendar.get(Calendar.HOUR_OF_DAY),
            initialMinute = calendar.get(Calendar.MINUTE),
            is24Hour = is24Hour
          )
          val timeTitle = props.timeTitle.value?.takeIf { it.isNotBlank() } ?: "Select time"
          var timeDisplayMode by remember { mutableStateOf(TimePickerDisplayMode.Picker) }
          val titleColor = tintColor ?: MaterialTheme.colorScheme.onSurface
          val toggleColor = tintColor ?: MaterialTheme.colorScheme.primary

          val confirmTimeSelection = {
            val result = Calendar.getInstance().apply {
              timeInMillis = baseTime
              set(Calendar.HOUR_OF_DAY, timePickerState.hour)
              set(Calendar.MINUTE, timePickerState.minute)
              set(Calendar.SECOND, 0)
              set(Calendar.MILLISECOND, 0)
            }
            onDateSelected(DatePickerResult(date = result.timeInMillis))
            showDialog = false
          }
          val timeDialogContainerColor = dialogBackgroundColor
            ?: TimePickerDialogDefaults.containerColor

          val modeToggleButton: @Composable () -> Unit = {
            TimePickerDialogDefaults.DisplayModeToggle(
              onDisplayModeChange = {
                playSound()
                timeDisplayMode = if (timeDisplayMode == TimePickerDisplayMode.Picker) {
                  TimePickerDisplayMode.Input
                } else {
                  TimePickerDisplayMode.Picker
                }
              },
              displayMode = timeDisplayMode
            )
          }

          TimePickerDialog(
            onDismissRequest = { showDialog = false },
            confirmButton = { DialogActionButton(confirmText, confirmTimeSelection) },
            title = {
              Text(
                text = timeTitle,
                style = MaterialTheme.typography.titleMedium,
                color = titleColor
              )
            },
            modeToggleButton = {
              CompositionLocalProvider(LocalContentColor provides toggleColor) {
                modeToggleButton()
              }
            },
            dismissButton = { DialogActionButton(dismissText) { showDialog = false } },
            containerColor = timeDialogContainerColor
          ) {
            val timePickerColors = tintColor?.let {
              TimePickerDefaults.colors(
                selectorColor = it,
                timeSelectorSelectedContainerColor = it,
                clockDialColor = it.copy(alpha = 0.3f)
              )
            } ?: TimePickerDefaults.colors()
            if (timeDisplayMode == TimePickerDisplayMode.Input) {
              TimeInput(
                state = timePickerState,
                modifier = composedModifier,
                colors = timePickerColors
              )
            } else {
              TimePicker(
                state = timePickerState,
                modifier = composedModifier,
                colors = timePickerColors
              )
            }
          }
        } else {
          val baseDatePickerColors = tintColor?.let {
            DatePickerDefaults.colors(
              titleContentColor = it,
              selectedDayContainerColor = it,
              todayDateBorderColor = it,
              headlineContentColor = it
            )
          } ?: DatePickerDefaults.colors()
          val datePickerColors = dialogBackgroundColor?.let {
            baseDatePickerColors.copy(containerColor = it)
          } ?: baseDatePickerColors

          var didInitDateSelectionSound by remember { mutableStateOf(false) }
          var didInitMonthChangeSound by remember { mutableStateOf(false) }
          var didInitDisplayModeSound by remember { mutableStateOf(false) }

          LaunchedEffect(datePickerState) {
            snapshotFlow { datePickerState.selectedDateMillis }
              .distinctUntilChanged()
              .collect {
                if (didInitDateSelectionSound) {
                  playSound()
                } else {
                  didInitDateSelectionSound = true
                }
              }
          }

          LaunchedEffect(datePickerState) {
            snapshotFlow { datePickerState.displayedMonthMillis }
              .distinctUntilChanged()
              .collect {
                if (didInitMonthChangeSound) {
                  playSound()
                } else {
                  didInitMonthChangeSound = true
                }
              }
          }

          LaunchedEffect(datePickerState) {
            snapshotFlow { datePickerState.displayMode }
              .distinctUntilChanged()
              .collect {
                if (didInitDisplayModeSound) {
                  playSound()
                } else {
                  didInitDisplayModeSound = true
                }
              }
          }

          val confirmDateSelection = {
            onDateSelected(DatePickerResult(date = datePickerState.selectedDateMillis))
            showDialog = false
          }
          DatePickerDialog(
            onDismissRequest = { showDialog = false },
            confirmButton = { DialogActionButton(confirmText, confirmDateSelection) },
            dismissButton = { DialogActionButton(dismissText) { showDialog = false } },
            colors = datePickerColors
          ) {
            DatePicker(
              state = datePickerState,
              modifier = composedModifier,
              showModeToggle = props.showVariantToggle.value,
              colors = datePickerColors
            )
          }
        }
      }
    }
  }
}
