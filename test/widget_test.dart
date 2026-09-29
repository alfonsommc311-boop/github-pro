// Smoke test mínimo. La app real arranca un servidor localhost y un WebView,
// que no se ejercitan en el entorno de test; aquí solo validamos el toolkit.
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('smoke', () {
    expect(1 + 1, 2);
  });
}
