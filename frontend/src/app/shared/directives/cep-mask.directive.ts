import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCepMask]',
  standalone: true
})
export class CepMaskDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove todos os não-dígitos
    
    // Limita a 8 dígitos
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    
    // Formata como 00000-000
    if (value.length > 5) {
      input.value = `${value.slice(0, 5)}-${value.slice(5)}`;
    } else {
      input.value = value;
    }
  }
}