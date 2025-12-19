package expo.modules.sykamoreui

import android.annotation.SuppressLint
import android.content.Context
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView
import java.util.Date

data class DatePickerResult(
  @Field
  val date: Long?
) : Record

data class DatePickerProps(
  val initialDate: MutableState<Long?> = mutableStateOf(null),
  val confirmText: MutableState<String> = mutableStateOf("OK"),
  val dismissText: MutableState<String> = mutableStateOf("Cancel")
) : ComposeProps

@SuppressLint("ViewConstructor")
@OptIn(ExperimentalMaterial3Api::class)
class DatePickerView(context: Context, appContext: AppContext) :
  ExpoComposeView<DatePickerProps>(context, appContext, withHostingView = true) {
  override val props = DatePickerProps()
  private val onDateSelected by EventDispatcher<DatePickerResult>()
  private val onDismiss by EventDispatcher()

  @Composable
  override fun Content(modifier: Modifier) {
    var showDialog by remember { mutableStateOf(true) }
    val datePickerState = rememberDatePickerState(
      initialSelectedDateMillis = props.initialDate.value ?: Date().time
    )
    
    LaunchedEffect(showDialog) {
      if (!showDialog) {
        onDismiss(emptyMap<String, Any>())
      }
    }

    if (showDialog) {
      DynamicTheme {
        DatePickerDialog(
          onDismissRequest = {
            showDialog = false
          },
          confirmButton = {
            TextButton(onClick = {
              onDateSelected(DatePickerResult(date = datePickerState.selectedDateMillis))
              showDialog = false
            }) {
              Text(props.confirmText.value)
            }
          },
          dismissButton = {
            TextButton(onClick = {
              showDialog = false
            }) {
              Text(props.dismissText.value)
            }
          }
        ) {
          DatePicker(state = datePickerState)
        }
      }
    }
  }
}
