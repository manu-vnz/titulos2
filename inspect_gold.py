import docx
import re

doc_gold = docx.Document(r"F:\intento 2\plantillas\JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx")

print("--- GOLD STANDARD TEMPLATE TEXTS ---")
container_elems = doc_gold.element.xpath('.//*[local-name()="shape" or local-name()="p"]')
for i, container in enumerate(container_elems):
    t_nodes = container.xpath('.//*[local-name()="t"]')
    if t_nodes:
        full_text = "".join([t.text for t in t_nodes if t.text])
        if full_text.strip():
            print(f"Elem#{i}: {repr(full_text.strip())}")
