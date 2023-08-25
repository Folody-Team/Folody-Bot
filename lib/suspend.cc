#include <napi.h>
#include <iostream>
#include <cstdlib>
#include <windows.h>

static inline Napi::Boolean suspend(const Napi::CallbackInfo &info)
{

  const auto number_pid = info[0].ToNumber();
  const auto double_pid = number_pid.DoubleValue();
  const DWORD dword_pid = number_pid.Uint32Value();

  if (isnan(double_pid) || !isfinite(double_pid) || (double) dword_pid != double_pid) {
    std::cout << "false" << std::endl;
  }
  HANDLE hProcess = OpenProcess(PROCESS_SUSPEND_RESUME, FALSE, dword_pid);

  if (hProcess == NULL) {
    std::cout << "false" << std::endl;
  }
  CloseHandle(hProcess);

  std::cout << dword_pid << std::endl;
  
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{

  exports.Set("suspend", Napi::Function::New(env, suspend));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)